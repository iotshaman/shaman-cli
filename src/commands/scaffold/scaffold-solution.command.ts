import * as _path from 'path';
import { ICommand } from "../../commands/command";
import { IFileService, FileService } from "../../services/file.service";
import { Solution, SolutionProject } from "../../models/solution";
import { DependencyTree } from '../../models/dependency-tree';
import { NodeScaffoldCommand } from './node/node-scaffold.command';
import { ITransformationService, TransformationService } from '../../services/transformation.service';

export class ScaffoldSolutionCommand implements ICommand {

  get name(): string { return "scaffold-solution"; }
  fileService: IFileService = new FileService();
  transformationService: ITransformationService = new TransformationService();
  scaffoldCommands: ICommand[] = [
    new NodeScaffoldCommand()
  ]

  run = (solutionFilePath: string): Promise<void> => {
    if (!solutionFilePath) solutionFilePath = './shaman.json'
    console.log(`Scaffolding solution...`);
    let solution: Solution;
    return this.fileService.getShamanFile(solutionFilePath)
      .then(rslt => solution = rslt)
      .then(_ => this.scaffoldSolution(solutionFilePath, solution))
      .then(_ => this.transformationService.performTransformations(solution, solutionFilePath))
      .then(_ => {
        console.log("Solution scaffolding is complete.");
      });
  }

  private scaffoldSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    let cwd = solutionFilePath.replace('shaman.json', '');
    if (!solution.projects.length) {
      console.warn("No projects found in solution file.");
      return Promise.resolve();
    }
    let dependencyTree = new DependencyTree(solution.projects);
    let scaffoldOrder = dependencyTree.getOrderedProjectList();
    return scaffoldOrder.reduce((a, b) => a.then(_ => {
      let project = solution.projects.find(p => p.name == b);
      return this.scaffoldProject(project, cwd, solution);
    }), Promise.resolve());
  }

  private scaffoldProject = (project: SolutionProject, cwd: string, solution: Solution): Promise<void> => {    
    let cmd = this.scaffoldCommands.find(c => c.name == `scaffold-${project.environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${project.environment}'.`));
    if (!!cmd.assignSolution) cmd.assignSolution(solution);
    let projectPath = _path.join(cwd, project.path);
    return cmd.run(project.type, project.name, projectPath, project.language);
  }

}