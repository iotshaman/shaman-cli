import * as _path from 'path';
import * as _cmd from 'child_process';
import { Template } from '../../..';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';

export class NodeEnvironmentScaffoldCommand implements ICommand {

  get name(): string { return "scaffold-node"; }
  fileService: IFileService = new FileService();
  private templatesFolder = [__dirname, '..', '..', '..', '..', 'templates'];
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  run = (projectType: string, name: string, output: string): Promise<void> => {
    if (!projectType) return Promise.reject(new Error("Project type argument not provided to scaffold-node command."));
    if (!name) return Promise.reject(new Error("Name argument not provided to scaffold-node command."));
    if (!output) return Promise.reject(new Error("Output argument not provided to scaffold-node command."));
    let outputPath = _path.join(process.cwd(), output);
    console.log(`Scaffolding node ${projectType}.`);
    return this.checkPath(outputPath)
      .then(_ => this.getTemplate(projectType))
      .then(template => this.unzipProject(template, outputPath))
      .then(_ => this.updatePackageDetails(outputPath, name))
      .then(_ => this.installDependencies(outputPath))
      .then(_ => {
        console.log("Scaffolding complete.");
      })
  }

  private checkPath = (outputPath: string): Promise<void> => {
    return this.fileService.pathExists(outputPath).then(exists => {
      if (!!exists) throw new Error("Output directory already exists.");
    })
  }

  private getTemplate = (projectType: string): Promise<Template> => {
    let path = _path.join(...this.templatesFolder, 'templates.json');
    return this.fileService.readJson<{templates: Template[]}>(path).then(data => {
      let template = data.templates.find(t => t.environment == "node" && t.type == projectType);
      if (!template) throw new Error(`Project type not found: node-${projectType}`);
      return template;
    });
  }

  private unzipProject = (template: Template, outputPath: string): Promise<void> => {
    let templatePath = _path.join(...this.templatesFolder, template.file);
    return this.fileService.unzipFile(templatePath, outputPath);
  }

  private updatePackageDetails = (outputPath: string, name: string): Promise<void> => {
    let packagePath = _path.join(outputPath, 'package.json')
    return this.fileService.readJson<any>(packagePath).then(pkg => {
      pkg.name = name;
      return this.fileService.writeJson(packagePath, pkg);
    });
  }

  private installDependencies = (outputPath: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log("Installing dependencies...")
      _cmd.exec(`${this.npm} install`, { cwd: outputPath}, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    })
  }

}