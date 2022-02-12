import * as _path from 'path';
import * as _cmd from 'child_process';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { Solution } from '../../../models/solution';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { DotnetEnvironmentService } from '../../../services/environments/dotnet-environment.service';

export class DotnetInstallCommand implements ICommand {

  get name(): string { return "install-dotnet"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new DotnetEnvironmentService();

  run = (_environment: string, solutionFilePath: string): Promise<void> => {
    solutionFilePath = _path.join(process.cwd(), solutionFilePath);
    console.log(`Installing dotnet solution.`);
    return this.fileService.getShamanFile(solutionFilePath)
      .then(solution => this.installSolution(solutionFilePath, solution));
  }

  private installSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    if (!solution.projects.some(p => p.environment == "dotnet")) {
      console.log("No dotnet project detected, skipping dotnet install.");
      return Promise.resolve();
    }
    let solutionFolderPath = solutionFilePath.replace('shaman.json', '');
    return this.environmentService.installDependencies(solutionFolderPath);
  }

}