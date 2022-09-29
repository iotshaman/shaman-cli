import * as _path from 'path';
import * as _cmd from 'child_process';
import { IChildCommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { Solution } from '../../../models/solution';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { DotnetEnvironmentService } from '../../../services/environments/dotnet-environment.service';

export class DotnetBuildCommand implements IChildCommand {

  get name(): string { return "build-dotnet"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new DotnetEnvironmentService();

  constructor(
    private solutionFilePath: string
  ) { }

  run = (): Promise<void> => {
    this.solutionFilePath = _path.join(process.cwd(), this.solutionFilePath);
    return this.fileService.getShamanFile(this.solutionFilePath)
      .then(solution => this.buildSolution(this.solutionFilePath, solution));
  }

  private buildSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    if (!solution.projects.some(p => p.environment == "dotnet")) {
      console.log("No dotnet project detected, skipping dotnet build.");
      return Promise.resolve();
    }
    let solutionFolderPath = solutionFilePath.replace('shaman.json', '');
    return this.environmentService.buildProject(solution.name, solutionFolderPath);
  }

}