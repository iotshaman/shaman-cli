import * as _path from 'path';
import { Solution } from '../../../models/solution';
import { ICommand } from '../../command';
import { FileService, IFileService } from '../../../services/file.service';
import { DependencyTree } from '../../../models/dependency-tree';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';

export class NodePublishCommand implements ICommand {
    get name(): string { return "publish-node" };
    fileService = new FileService();
    environmentService: IEnvironmentService = new NodeEnvironmentService();

    run = (environment: string, solutionFilePath: string): Promise<void> => {
        if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
        else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
        console.log(`Publishing node solutions...`);        
        return this.fileService.getShamanFile(solutionFilePath)
            .then(solution => this.publishSolution(environment, solutionFilePath, solution));
    }

    private publishSolution = (environment: string, solutionFilePath: string, solution: Solution): Promise<void> => {        
        let binPath = solutionFilePath.replace('shaman.json', 'bin/');
        this.fileService.pathExists(`${binPath}node`)
            .then(exists => { if (!exists) this.fileService.createFolder(binPath, 'node')});
        let cwd = solutionFilePath.replace('shaman.json', '');
        let projects = solution.projects.filter(p => p.environment == environment);
        if (!projects.length) return Promise.resolve();
        let dependencyTree = new DependencyTree(projects);
        let buildOrder = dependencyTree.getOrderedProjectList();
        return buildOrder.reduce((a, b) => a.then(_ => {
            let project = solution.projects.find(p => p.name == b);
            let destinationPath = _path.join(cwd, `bin/node/${project.path}`);
            return this.environmentService.publishProject(project.name, _path.join(cwd, project.path), destinationPath);
        }), Promise.resolve());  
    }

}