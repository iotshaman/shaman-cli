import * as _path from 'path';
import { ICommand } from "../../commands/command";
import { NodeEnvironmentRunCommand } from "./environments/node-environment.run-command";
import { FileService, IFileService } from '../../services/file.service';
import { Solution } from '../../models/solution';

export class RunCommand implements ICommand {

  get name(): string { return "run"; }
  runCommands: ICommand[] = [
    new NodeEnvironmentRunCommand()
  ]
  fileService: IFileService = new FileService();

  run = (project: string, script: string, solutionFilePath: string): Promise<void> => {
    if (!project) return Promise.reject(new Error("Project argument not provided to run command."));
    if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
    else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
    return this.getShamanFile(solutionFilePath)
      .then(solution => {
        let solutionProject = solution.projects.find(p => p.name == project);
        if (!solutionProject) throw new Error(`Invalid project '${project}'.`);
        let cmd = this.runCommands.find(c => c.name == `run-${solutionProject.environment}`);
        if (!cmd) return Promise.reject(new Error(`Invalid environment '${solutionProject.environment}'.`));
        return cmd.run(project, script, solutionFilePath);
      });
  }

  private getShamanFile = (solutionFilePath: string): Promise<Solution> => {
    return this.fileService.pathExists(solutionFilePath).then(exists => {
      if (!exists) throw new Error("Solution file does not exist in specified location.");
      return this.fileService.readJson<Solution>(solutionFilePath);
    });
  }

}