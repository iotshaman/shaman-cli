import * as _path from 'path';
import { Solution, Template } from '../../..';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';

export class NodeScaffoldCommand implements ICommand {

  get name(): string { return "scaffold-node"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new NodeEnvironmentService();
  private templatesFolder = [__dirname, '..', '..', '..', '..', 'templates'];
  private solution: Solution;

  assignSolution = (solution: Solution) => {
    this.solution = solution;
  }

  run = (projectType: string, name: string, output: string): Promise<void> => {
    if (!projectType) return Promise.reject(new Error("Project type argument not provided to scaffold-node command."));
    if (!name) return Promise.reject(new Error("Name argument not provided to scaffold-node command."));
    if (!output) return Promise.reject(new Error("Output argument not provided to scaffold-node command."));
    let folderPath = _path.join(process.cwd(), output);
    console.log(`Scaffolding node ${projectType}.`);
    return this.checkPath(folderPath)
      .then(_ => this.getTemplate(projectType))
      .then(template => this.unzipProject(template, folderPath))
      .then(_ => this.environmentService.updateProjectDefinition(folderPath, name, this.solution))
      .then(_ => this.environmentService.addProjectScaffoldFile(folderPath, name, this.solution))
      .then(_ => this.environmentService.installDependencies(folderPath, name))
      .then(_ => this.environmentService.executeProjectScaffolding(folderPath))
      .then(_ => {
        console.log("Scaffolding complete.");
      })
  }

  private checkPath = (folderPath: string): Promise<void> => {
    return this.fileService.pathExists(folderPath).then(exists => {
      if (!!exists) throw new Error("Output directory already exists.");
    })
  }

  // TODO: move into template service
  private getTemplate = (projectType: string): Promise<Template> => {
    let path = _path.join(...this.templatesFolder, 'templates.json');
    return this.fileService.readJson<{templates: Template[]}>(path).then(data => {
      let template = data.templates.find(t => t.environment == "node" && t.type == projectType);
      if (!template) throw new Error(`Project type not found: node-${projectType}`);
      return template;
    });
  }

  private unzipProject = (template: Template, folderPath: string): Promise<void> => {
    let templatePath = _path.join(...this.templatesFolder, template.file);
    return this.fileService.unzipFile(templatePath, folderPath);
  }

}