import * as _path from 'path';
import { ICommand } from "../../commands/command";
import { Solution, SolutionProject } from '../../models/solution';
import { IFileService, FileService } from "../../services/file.service";
import { DependencyTree } from '../../models/dependency-tree';
import { IChildCommand, NodeRunCommand } from '..';
import { DotnetRunCommand } from '../run/dotnet/dotnet-run.command';
import { CommandLineArguments } from '../../command-line-arguments';

export class ServeCommand implements ICommand {

  get name(): string { return "serve"; }
  /* istanbul ignore next */
  runCommands: IChildCommand[] = [];
  fileService: IFileService = new FileService();
  childCommandFactory: (solution: Solution, solutionFilePath: string) => IChildCommand[];

  private project;
  private solutionFilePath;

  constructor() {
    this.childCommandFactory = (solution: Solution, solutionFilePath: string): IChildCommand[] => [
      new DotnetRunCommand(solution, solutionFilePath),
      new NodeRunCommand('start', solution, solutionFilePath)
    ]
  }

  run = (cla: CommandLineArguments): Promise<void> => {
    this.assignArguments(cla);
    if (!this.project) return Promise.reject(new Error('Project argument not provided to serve command.'));
    return this.fileService.getShamanFile(this.solutionFilePath)
      .then(solution => {
        this.runCommands = this.childCommandFactory(solution, this.solutionFilePath);
        let solutionProject = solution.projects.find(p => p.name == this.project);
        if (!solutionProject) throw new Error(`Invalid project '${this.project}'.`);
        return this.serveProject(this.project, solution);
      })
      .then(commands => Promise.all(commands.map(cmd => cmd.waitForChildProcesses)))
      .then(_ => (null));
  }

  private serveProject = (projectName: string, solution: Solution): Promise<IChildCommand[]> => {
    let commands: IChildCommand[] = [];
    let dependencyTree = new DependencyTree(solution.projects, 'runtimeDependencies');
    let buildOrder = dependencyTree.getOrderedProjectListFromNode(projectName);
    let serveTask = buildOrder.reduce((a, b) => a.then(_ => {
      let project = solution.projects.find(p => p.name == b);
      return this.serveRuntimeDependency(project)
        .then(cmd => commands.push(cmd))
        .then(_ => (null));
    }), Promise.resolve());
    return serveTask.then(_ => commands);
  }

  private serveRuntimeDependency = (project: SolutionProject): Promise<IChildCommand> => {
    let cmd = this.runCommands.find(c => c.name == `run-${project.environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${project.environment}'.`));
    cmd.assignProject(project);
    return cmd.run().then(_ => (cmd));
  }

  private assignArguments = (cla: CommandLineArguments) => {
    this.project = cla.getValueOrDefault('project');
    this.solutionFilePath = cla.getValueOrDefault("filePath");
  }

}