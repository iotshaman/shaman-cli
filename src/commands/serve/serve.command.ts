import * as _path from 'path';
import { ICommand } from "../../commands/command";
import { Solution, SolutionProject } from '../../models/solution';
import { IFileService, FileService } from "../../services/file.service";
import { DependencyTree } from '../../models/dependency-tree';
import { NodeRunCommand } from '..';

export class ServeCommand implements ICommand {

  get name(): string { return "serve"; }
  /* istanbul ignore next */
  runCommands: {name: string, instance: () => ICommand}[] = [
    { name: 'run-node', instance: () => new NodeRunCommand() }
  ]
  fileService: IFileService = new FileService();

  run = (project: string, solutionFilePath: string): Promise<void> => {
    if (!solutionFilePath) solutionFilePath = './shaman.json'
    return this.fileService.getShamanFile(solutionFilePath)
      .then(solution => {
        let solutionProject = solution.projects.find(p => p.name == project);
        if (!solutionProject) throw new Error(`Invalid project '${project}'.`);
        return this.serveProject(project, solution, solutionFilePath);
      })
      .then(commands => Promise.all(commands.map(cmd => cmd.waitForChildProcesses)))
      .then(_ => (null));
  }

  private serveProject = (projectName: string, solution: Solution, solutionFilePath: string): Promise<ICommand[]> => {   
    let commands: ICommand[] = [];
    let dependencyTree = new DependencyTree(solution, 'runtimeDependencies'); 
    let buildOrder = dependencyTree.getOrderedProjectListFromNode(projectName);
    let serveTask = buildOrder.reduce((a, b) => a.then(_ => {
      let project = solution.projects.find(p => p.name == b);
      return this.serveRuntimeDependency(project, solution, solutionFilePath)
        .then(cmd => commands.push(cmd))
        .then(_ => (null));
    }), Promise.resolve());
    return serveTask.then(_ => commands);
  }

  private serveRuntimeDependency = (project: SolutionProject, solution: Solution, solutionFilePath: string): Promise<ICommand> => {
    let cmdFactory = this.runCommands.find(c => c.name == `run-${project.environment}`);
    if (!cmdFactory) return Promise.reject(new Error(`Invalid environment '${project.environment}'.`));
    let cmd = cmdFactory.instance();
    if (!!cmd.assignSolution) cmd.assignSolution(solution);
    return cmd.run(project.name, 'start', solutionFilePath).then(_ => (cmd));
  }

}