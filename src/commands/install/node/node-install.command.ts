import * as _path from 'path';
import * as _cmd from 'child_process';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { Solution } from '../../../models/solution';
import { DependencyTree } from '../../../models/dependency-tree';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';

export class NodeInstallCommand implements ICommand {

  get name(): string { return "install-node"; }
  fileService: IFileService = new FileService();
  environmentService: IEnvironmentService = new NodeEnvironmentService();

  run = (solutionFilePath: string): Promise<void> => {
    if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
    else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
    console.log(`Installing node solution.`);
    return this.fileService.getShamanFile(solutionFilePath)
      .then(solution => this.installSolution(solutionFilePath, solution))
      .then(_ => {
        console.log("Solution install is complete.");
      });
  }

  private installSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    let cwd = solutionFilePath.replace('shaman.json', '');
    if (!solution.projects.length) return Promise.resolve();
    let dependencyTree = new DependencyTree(solution);
    let buildOrder = dependencyTree.getOrderedProjectList();
    return buildOrder.reduce((a, b) => a.then(_ => {
      let project = solution.projects.find(p => p.name == b);
      return this.environmentService.installDependencies(_path.join(cwd, project.path), project.name);
    }), Promise.resolve());
  }

}