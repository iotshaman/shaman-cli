import * as _path from 'path';
import { Solution } from '../../../models/solution';
import { ICommand } from '../../command';
import { FileService } from '../../../services/file.service';
import { DependencyTree } from '../../../models/dependency-tree';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';

export class NodePublishCommand implements ICommand {
    get name(): string { return "publish-node" };
    fileService = new FileService();
    environmentService: IEnvironmentService = new NodeEnvironmentService();

    run = (solutionFilePath: string): Promise<void> => {
        solutionFilePath = _path.join(process.cwd(), solutionFilePath);
        return this.fileService.getShamanFile(solutionFilePath)
            .then(solution => this.publishSolution(solutionFilePath, solution));
    }

    private publishSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
        let cwd = solutionFilePath.replace('shaman.json', '');
        let binPath = _path.join(cwd, 'bin/');
        let projects = solution.projects.filter(p => p.environment == "node");
        if (!projects.length) return Promise.resolve();
        console.log("Publishing node projects...");
        let dependencyTree = new DependencyTree(projects);
        let publishOrder = dependencyTree.getOrderedProjectList();
        return this.createEnvironmentPublishFolder(binPath)
            .then(_ => publishOrder.reduce((a, b) => a.then(_ => {
                let project = solution.projects.find(p => p.name == b);
                let destinationPath = _path.join(binPath, "node", project.path);
                return this.environmentService.publishProject(project.name, _path.join(cwd, project.path), destinationPath)
                    .then(_ => this.fileService.copyFolder(_path.join(cwd, project.path, "dist/"), destinationPath));
            }), Promise.resolve()))
            .then(_ => console.log("Node projects published successfully..."));
    }

    private createEnvironmentPublishFolder = (binPath: string): Promise<void> => {
        let nodePublishFolder = _path.join(binPath, "node");
        return this.fileService.pathExists(nodePublishFolder)
            .then(exists => { if (!exists) this.fileService.createFolder(binPath, "node") })
    }

}