import * as _path from 'path';
import * as _cmd from 'child_process';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { Solution } from '../../../models/solution';
import { DependencyTree } from '../../../models/dependency-tree';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';

export class NodeEnvironmentBuildCommand implements ICommand {

  get name(): string { return "build-node"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new NodeEnvironmentService();

  run = (solutionFilePath: string): Promise<void> => {
    if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
    else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
    console.log(`Building node solution.`);
    return this.fileService.getShamanFile(solutionFilePath)
      .then(solution => this.buildSolution(solutionFilePath, solution))
      .then(_ => {
        console.log("Solution build is complete.");
      });
  }

  private buildSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    let cwd = solutionFilePath.replace('shaman.json', '');
    if (!solution.projects.length) return Promise.resolve();
    let dependencyTree = new DependencyTree(solution);
    let buildOrder = dependencyTree.getOrderedProjectList();
    return buildOrder.reduce((a, b) => a.then(_ => {
      let project = solution.projects.find(p => p.name == b);
      return this.environmentService.buildProject(project.name, _path.join(cwd, project.path));
    }), Promise.resolve());
  }

}