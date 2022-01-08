import * as _path from 'path';
import { ICommand } from "../../commands/command";
import { IFileService, FileService } from "../../services/file.service";
import { Solution, SolutionProject } from "../../models/solution";
import { NodeEnvironmentScaffoldCommand } from './environments/node-environment.command';
import { DependencyTree } from '../../models/dependency-tree';

export class ScaffoldSolutionCommand implements ICommand {

  get name(): string { return "scaffold-solution"; }
  fileService: IFileService = new FileService();
  scaffoldCommands: ICommand[] = [
    new NodeEnvironmentScaffoldCommand()
  ]

  run = (solutionFilePath: string): Promise<void> => {
    if (!solutionFilePath) solutionFilePath = './shaman.json'
    console.log(`Scaffolding solution...`);
    return this.getShamanFile(solutionFilePath)
      .then(solution => this.buildSolution(solutionFilePath, solution))
      .then(_ => {
        console.log("Solution scaffolding is complete.");
      });
  }

  private getShamanFile = (solutionFilePath: string): Promise<Solution> => {
    let fullPath = _path.join(process.cwd(), solutionFilePath);
    return this.fileService.pathExists(fullPath).then(exists => {
      if (!exists) throw new Error("Solution file does not exist in specified location.");
      return this.fileService.readJson<Solution>(solutionFilePath);
    });
  }

  private buildSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    let cwd = solutionFilePath.replace('shaman.json', '');
    if (!solution.projects.length) {
      console.warn("No projects found in solution file.");
      return Promise.resolve();
    }
    let dependencyTree = new DependencyTree(solution);
    let buildOrder = dependencyTree.getOrderedProjectList();
    return buildOrder.reduce((a, b) => a.then(_ => {
      let project = solution.projects.find(p => p.name == b);
      return this.buildProject(project, cwd, solution);
    }), Promise.resolve());
  }

  private buildProject = (project: SolutionProject, cwd: string, solution: Solution): Promise<void> => {    
    let cmd = this.scaffoldCommands.find(c => c.name == `scaffold-${project.environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${project.environment}'.`));
    if (!!cmd.assignSolution) cmd.assignSolution(solution);
    let projectPath = _path.join(cwd, project.path);
    return cmd.run(project.type, project.name, projectPath);
  }

}