import * as _path from 'path';
import { Solution } from '../../../models/solution';
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

  assignSolution = (solution: Solution) => {
    this.solution = solution;
  }

  run = (solutionFolder: string, projectName: string): Promise<void> => {
    if (!this.solution) return Promise.reject(new Error("Projects can only be scaffold as part of a solution."));
    let project = this.solution.projects.find(p => p.name == projectName);
    if (!project) return Promise.reject(new Error(`Invalid project name '${projectName}'.`));
    if (!project.type) return Promise.reject(new Error(`Invalid project type configuration (project=${projectName}).`));
    if (!project.path) return Promise.reject(new Error(`Invalid project path configuration (project=${projectName}).`));
    let projectType = project.type, projectPath = project.path, name = project.name;
    let folderPath = _path.join(solutionFolder, projectPath);
    console.log(`Scaffolding node ${projectType}.`);
    return this.environmentService.checkNamingConvention(name)
      .then(_ => project.custom ?
        this.templateService.getCustomTemplate("node", projectType, this.solution.auth) :
        this.templateService.getTemplate("node", projectType))
      .then(template => project.custom ? 
        this.templateService.unzipCustomProjectTemplate(template, folderPath) : 
        this.templateService.unzipProjectTemplate(template, folderPath))
      .then(_ => this.environmentService.updateProjectDefinition(folderPath, name, this.solution))
      .then(_ => this.environmentService.addProjectScaffoldFile(folderPath, name, this.solution))
      .then(_ => this.environmentService.installDependencies(folderPath, name))
      .then(_ => this.environmentService.executeProjectScaffolding(folderPath))
      .then(_ => {
        console.log("Scaffolding complete.");
      })
  }
}
