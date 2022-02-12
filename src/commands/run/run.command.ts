import * as _path from 'path';
import { ICommand } from "../../commands/command";
import { FileService, IFileService } from '../../services/file.service';
import { DotnetRunCommand } from './dotnet/dotnet-run.command';
import { NodeRunCommand } from './node/node-run.command';

export class RunCommand implements ICommand {

  get name(): string { return "run"; }
  runCommands: ICommand[] = [
    new NodeRunCommand(),
    new DotnetRunCommand()
  ]
  fileService: IFileService = new FileService();

  run = (project: string, script: string, solutionFilePath: string): Promise<void> => {
    if (!project) return Promise.reject(new Error("Project argument not provided to run command."));
    if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
    else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
    return this.fileService.getShamanFile(solutionFilePath)
      .then(solution => {
        let solutionProject = solution.projects.find(p => p.name == project);
        if (!solutionProject) throw new Error(`Invalid project '${project}'.`);
        let cmd = this.runCommands.find(c => c.name == `run-${solutionProject.environment}`);
        if (!cmd) return Promise.reject(new Error(`Invalid environment '${solutionProject.environment}'.`));
        if (!!cmd.assignSolution) cmd.assignSolution(solution);
        return cmd.run(project, script, solutionFilePath).then(_ => cmd);
      })
      .then(cmd => cmd.waitForChildProcesses);
  }

}