import * as _path from 'path';
import { Solution, SolutionProject } from '../../../models/solution';
import { FileService, IFileService } from '../../../services/file.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';
import { ITemplateService, TemplateService } from '../../../services/template.service';
import { IChildCommand } from '../../command';

export class NodeScaffoldCommand implements IChildCommand {

  get name(): string { return "scaffold-node"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new NodeEnvironmentService();
  templateService: ITemplateService = new TemplateService();
  private project: SolutionProject;

  constructor(
    private solution: Solution,
    private solutionFolder: string
  ) { }

  assignProject = (project: SolutionProject) => {
    this.project = project;
  }

  run = (): Promise<void> => {
    if (!this.project) return Promise.reject(new Error("Project file has not been assigned to scaffold command."));
    let projectName = this.project.name;
    if (!this.project.template) return Promise.reject(new Error(`Invalid project template configuration (project=${projectName}).`));
    if (!this.project.path) return Promise.reject(new Error(`Invalid project path configuration (project=${projectName}).`));
    let projectTemplate = this.project.template, projectPath = this.project.path, name = this.project.name;
    let folderPath = _path.join(this.solutionFolder, projectPath);
    console.log(`Scaffolding node ${projectTemplate}.`);
    return this.environmentService.checkNamingConvention(name)
      .then(_ => {
        if (this.project.custom) return this.templateService.getCustomTemplate("node", projectTemplate, this.solution.auth);
        else return this.templateService.getTemplate("node", projectTemplate);
      })
      .then(template => {
        if (this.project.custom) return this.templateService.unzipCustomProjectTemplate(template, folderPath);
        else return this.templateService.unzipProjectTemplate(template, folderPath);
      })
      .then(_ => this.environmentService.updateProjectDefinition(folderPath, name, this.solution))
      .then(_ => this.environmentService.addProjectScaffoldFile(folderPath, name, this.solution))
      .then(_ => this.environmentService.installDependencies(folderPath, name))
      .then(_ => this.environmentService.executeProjectScaffolding(folderPath))
      .then(_ => {
        console.log("Scaffolding complete.");
      })
  }
}
