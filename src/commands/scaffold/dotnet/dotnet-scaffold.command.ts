import * as _path from 'path';
import { spawn } from 'child_process';
import { Solution, SolutionProject } from '../../../models/solution';
import { FileService, IFileService } from '../../../services/file.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { ITemplateService, TemplateService } from '../../../services/template.service';
import { DotnetEnvironmentService } from '../../../services/environments/dotnet-environment.service';
import { IChildCommand } from '../../command';

export class DotnetScaffoldCommand implements IChildCommand {

  get name(): string { return "scaffold-dotnet"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new DotnetEnvironmentService();
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
    let language = this.project.language;
    console.log(`Scaffolding dotnet ${projectTemplate}.`);
    return this.environmentService.checkNamingConvention(name, this.solution.name)
      .then(_ => this.addDotnetSolutionFile(this.solution.name, this.solutionFolder))
      .then(_ => this.fileService.createFolderRecursive(this.solutionFolder + projectPath))
      .then(_ => {
        if (this.project.custom) return this.templateService.getCustomTemplate("dotnet", projectTemplate, this.solution.auth, language);
        else return this.templateService.getTemplate("dotnet", projectTemplate, language);
      })
      .then(template => {
        if (this.project.custom) return this.templateService.unzipCustomProjectTemplate(template, folderPath);
        else return this.templateService.unzipProjectTemplate(template, folderPath);
      })
      .then(_ => this.environmentService.updateProjectDefinition(folderPath, name, this.solution))
      .then(_ => this.environmentService.addProjectScaffoldFile(folderPath, name, this.solution))
      .then(_ => this.environmentService.installDependencies(folderPath, name))
      .then(_ => this.environmentService.executeProjectScaffolding(folderPath))
      .then(_ => this.addDotnetProjectToSolutionFile(this.solution.name, this.solutionFolder, projectPath))
      .then(_ => {
        console.log("Scaffolding is complete.");
      })
  }

  private addDotnetSolutionFile = (solutionName: string, solutionFolder: string): Promise<void> => {
    const dotnetSolutionFilePath = _path.join(solutionFolder, `${solutionName}.sln`);
    return this.fileService.pathExists(dotnetSolutionFilePath).then(exists => {
      if (!!exists) return Promise.resolve();
      return new Promise((res, err) => {
        let childProcess = spawn("dotnet", ["new", "sln", "--name", solutionName], { cwd: solutionFolder });
        childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
        childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
        childProcess.on('close', (code) => code === 0 ? res() : err(
          new Error("An error occurred while adding dotnet solution file.")
        ));
      });
    });
  }

  private addDotnetProjectToSolutionFile = (solutionName: string, solutionFolder: string, projectFolder: string): Promise<void> => {
    return new Promise((res, err) => {
      let childProcess = spawn("dotnet", ["sln", `${solutionName}.sln`, "add", projectFolder], { cwd: solutionFolder });
      childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
      childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
      childProcess.on('close', (code) => code === 0 ? res() : err(
        new Error("An error occurred while adding dotnet project to solution.")
      ));
    });
  }

}