import * as _path from 'path';
import { Solution } from '../../../models/solution';
import { ICommand } from '../../command';
import { FileService } from '../../../services/file.service';
import { DotnetEnvironmentService } from '../../../services/environments/dotnet-environment.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';

export class DotnetPublishCommand implements ICommand {
  
  get name(): string { return "publish-dotnet" };
  fileService = new FileService();
  environmentService: IEnvironmentService = new DotnetEnvironmentService();

  run = (solutionFilePath: string): Promise<void> => {
    solutionFilePath = _path.join(process.cwd(), solutionFilePath);
    return this.fileService.getShamanFile(solutionFilePath)
      .then(solution => this.publishSolution(solutionFilePath, solution))
      .then(_ => console.log("Dotnet projects published successfully..."));
  }

  private publishSolution(solutionFilePath: string, solution: Solution): Promise<void> {
    let cwd = solutionFilePath.replace('shaman.json', '');
    let binPath = _path.join(cwd, 'bin/');
    let projects = solution.projects.filter(p => p.environment == "dotnet");
    if (!projects.length) return Promise.resolve();
    console.log("Publishing dotnet projects...");
    let projectNames = projects.map(p => p.name);
    return this.environmentService.buildProject(solution.name, cwd)
      .then(_ => this.fileService.ensureFolderExists(binPath, "dotnet"))
      .then(_ => projectNames.reduce((a, b) => a.then(_ => {
        let project = projects.find(p => p.name == b);
        let destinationPath = _path.join(binPath, "dotnet",project.path);
        return this.environmentService.publishProject(project.name, _path.join(cwd, project.path), destinationPath);
      }), Promise.resolve()));
  }

}