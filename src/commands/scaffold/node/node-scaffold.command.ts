import * as _path from 'path';
import { Solution, SolutionProject } from '../../../models/solution';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';
import { ITemplateService, TemplateService } from '../../../services/template.service';

export class NodeScaffoldCommand implements ICommand {

  get name(): string { return "scaffold-node"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new NodeEnvironmentService();
  templateService: ITemplateService = new TemplateService();
  private solution: Solution;
  private project: SolutionProject;

  assignSolution = (solution: Solution) => {
    this.solution = solution;
  }

  assignProject = (project: SolutionProject) => {
    this.project = project;
  }

  run = (solutionFolder: string, _language: string = "typescript"): Promise<void> => {
    if (!this.project.type) return Promise.reject(new Error("Project type argument not provided to scaffold-node command."));
    if (!this.project.path) return Promise.reject(new Error("Project path argument not provided to scaffold-node command."))
    if (!this.project.name) return Promise.reject(new Error("Name argument not provided to scaffold-node command."));
    let projectType = this.project.type, projectPath = this.project.path, name = this.project.name;
    if (!solutionFolder) return Promise.reject(new Error("Solution folder argument not provided to scaffold-node command."));
    let folderPath = _path.join(solutionFolder, projectPath);
    console.log(`Scaffolding node ${projectType}.`);
    return this.environmentService.checkNamingConvention(name)
      .then(_ => this.templateService.getTemplate("node", projectType))
      .then(template => this.templateService.unzipProjectTemplate(template, folderPath))
      .then(_ => this.environmentService.updateProjectDefinition(folderPath, name, this.solution))
      .then(_ => this.environmentService.addProjectScaffoldFile(folderPath, name, this.solution))
      .then(_ => this.environmentService.installDependencies(folderPath, name))
      .then(_ => this.environmentService.executeProjectScaffolding(folderPath))
      .then(_ => {
        console.log("Scaffolding complete.");
      })
  }
}
