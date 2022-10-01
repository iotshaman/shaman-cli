import * as _path from 'path';
import { CommandLineArguments } from '../../command-line-arguments';
import { IChildCommand, ICommand } from "../../commands/command";
import { Solution, SolutionProject } from '../../models/solution';
import { FileService, IFileService } from '../../services/file.service';
import { DotnetRunCommand } from './dotnet/dotnet-run.command';
import { NodeRunCommand } from './node/node-run.command';

export class RunCommand implements ICommand {

  get name(): string { return "run"; }
  runCommands: IChildCommand[] = [];
  fileService: IFileService = new FileService();
  childCommandFactory: (script: string, solution: Solution, solutionFilePath: string) => IChildCommand[];

  private project: string;
  private script: string;
  private solutionFilePath: string;

  constructor() {
    this.childCommandFactory = (script: string, solution: Solution, solutionFilePath: string): IChildCommand[] => {
      return [
        new NodeRunCommand(script, solution, solutionFilePath),
        new DotnetRunCommand(solution, solutionFilePath)
      ]
    }
  }

  run = (cla: CommandLineArguments): Promise<void> => {
    this.assignArguments(cla);
    return this.fileService.getShamanFile(this.solutionFilePath)
      .then(solution => {
        this.runCommands = this.childCommandFactory(this.script, solution, this.solutionFilePath);
        let solutionProject = solution.projects.find(p => p.name == this.project);
        if (!solutionProject) throw new Error(`Invalid project '${this.project}'.`);
        let cmd = this.runCommands.find(c => c.name == `run-${solutionProject.environment}`);
        if (!cmd) return Promise.reject(new Error(`Invalid environment '${solutionProject.environment}'.`));
        if (!!cmd.assignProject) cmd.assignProject(solutionProject);
        return cmd.run().then(_ => cmd);
      })
      .then(cmd => cmd.waitForChildProcesses);
  }

  private assignArguments = (cla: CommandLineArguments) => {
    this.project = cla.getValueOrDefault('project');
    if (!this.project) throw new Error('Project argument not provided to run command.');
    this.solutionFilePath = _path.join(process.cwd(), cla.getValueOrDefault('filePath'));
    this.script = cla.getValueOrDefault('script');
  }

}
