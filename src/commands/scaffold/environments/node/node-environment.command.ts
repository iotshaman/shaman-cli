import * as _path from 'path';
import * as _fsx from 'fs-extra';
import { Template } from '../../../..';
import { ICommand } from "../../../command";
import { FileService, IFileService } from '../../../../services/file.service';

export class NodeEnvironmentCommand implements ICommand {

  get name(): string { return "scaffold-node"; }
  fileService: IFileService = new FileService();
  private templatesFolder = [__dirname, '..', '..', '..', '..', '..', 'templates'];

  run = (projectType: string, name: string, output: string): Promise<void> => {
    if (!projectType) return Promise.reject(new Error("Project type argument not provided to scaffold-node command."));
    if (!name) return Promise.reject(new Error("Name argument not provided to scaffold-node command."));
    if (!output) return Promise.reject(new Error("Output argument not provided to scaffold-node command."));
    let outputPath = _path.join(process.cwd(), output);
    console.log(`Scaffolding node ${projectType}.`);
    return this.getTemplate(projectType)
      .then(template => this.unzipProject(template, outputPath))
      .then(_ => this.updatePackageDetails(outputPath, name))
  }

  private getTemplate = (projectType: string): Promise<Template> => {
    let path = _path.join(...this.templatesFolder, 'templates.json');
    return this.fileService.readJson<{templates: Template[]}>(path).then(data => {
      let template = data.templates.find(t => t.environment == "node" && t.type == projectType);
      if (!template) throw new Error(`Template not found: node-${projectType}`);
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
    })
  }

}