import * as _path from 'path';
import { spawn } from 'child_process';
import { Solution } from '../../../models/solution';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { ITemplateService, TemplateService } from '../../../services/template.service';
import { DotnetEnvironmentService } from '../../../services/environments/dotnet-environment.service';

export class DotnetScaffoldCommand implements ICommand {

  get name(): string { return "scaffold-dotnet"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new DotnetEnvironmentService();
  templateService: ITemplateService = new TemplateService();
  private solution: Solution;

  assignSolution = (solution: Solution) => {
    this.solution = solution;
  }

  run = (projectType: string, projectPath: string, name: string, solutionFolder: string, language: string = "csharp"): Promise<void> => {
    if (!this.solution) return Promise.reject(new Error("Dotnet projects can only be scaffold as part of a solution."));
    if (!projectType) return Promise.reject(new Error("Project type argument not provided to scaffold-dotnet command."));
    if (!projectPath) return Promise.reject(new Error("Project path argument not provided to scaffold-dotnet command."))
    if (!name) return Promise.reject(new Error("Name argument not provided to scaffold-dotnet command."));
    if (!solutionFolder) return Promise.reject(new Error("Solution folder argument not provided to scaffold-dotnet command."));
    let folderPath = _path.join(solutionFolder, projectPath);
    console.log(`Scaffolding dotnet ${projectType}.`);
    return this.addDotnetSolutionFile(this.solution.name, solutionFolder)
      .then(_ => this.fileService.createFolder(solutionFolder, projectPath))
      .then(_ => this.templateService.getTemplate("dotnet", projectType, language))
      .then(template => this.templateService.unzipProjectTemplate(template, folderPath)) 
      .then(_ => this.environmentService.updateProjectDefinition(folderPath, name, this.solution))
      .then(_ => this.environmentService.addProjectScaffoldFile(folderPath, name, this.solution))
      .then(_ => this.environmentService.installDependencies(folderPath, name))
      .then(_ => this.environmentService.executeProjectScaffolding(folderPath))
      .then(_ => this.addDotnetProjectToSolutionFile(this.solution.name, solutionFolder, projectPath))
      .then(_ => {
        console.log("Scaffolding is complete.");
      })
  }

  private addDotnetSolutionFile = (solutionName: string, solutionFolder: string): Promise<void> => {
    if (!solutionName) return Promise.reject(new Error("Dotnet solutions require a name, please update your shaman.json file."));
    const dotnetSolutionFilePath = _path.join(solutionFolder, `${solutionName}.sln`);
    return this.fileService.pathExists(dotnetSolutionFilePath).then(exists => {
      if (!!exists) return Promise.resolve();
      return new Promise((res, err) => {
        let childProcess = spawn("dotnet", ["new", "sln", "--name", solutionName], {cwd: solutionFolder});
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
      let childProcess = spawn("dotnet", ["sln", `${solutionName}.sln`, "add", projectFolder], {cwd: solutionFolder});
      childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
      childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
      childProcess.on('close', (code) => code === 0 ? res() : err(
        new Error("An error occurred while adding dotnet project to solution.")
      ));
    });
  }

}