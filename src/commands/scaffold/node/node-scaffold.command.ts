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

  run = (projectType: string, projectPath: string, name: string, solutionFolder: string, _language: string = "typescript"): Promise<void> => {
    if (!projectType) return Promise.reject(new Error("Project type argument not provided to scaffold-node command."));
    if (!projectPath) return Promise.reject(new Error("Project path argument not provided to scaffold-node command."))
    if (!name) return Promise.reject(new Error("Name argument not provided to scaffold-node command."));
    if (!solutionFolder) return Promise.reject(new Error("Solution folder argument not provided to scaffold-node command."));
    let folderPath = _path.join(solutionFolder, projectPath);
    console.log(`Scaffolding node ${projectType}.`);
    return this.templateService.getTemplate("node", projectType)
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
