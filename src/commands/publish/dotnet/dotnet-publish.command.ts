import * as _path from 'path';
import { Solution } from '../../../models/solution';
import { ICommand } from '../../command';
import { FileService } from '../../../services/file.service';
import { DotnetEnvironmentService } from '../../../services/environments/dotnet-environment.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';

export class DotnetPublishCommand implements ICommand {
    get name(): string { return "publish-dotnet" };
    fileService = new FileService();
    environmentService: IEnvironmentService = new DotnetEnvironmentService();

    run = (environment: string, solutionFilePath: string): Promise<void> => {
        if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
        else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
        return this.fileService.getShamanFile(solutionFilePath)
            .then(solution => this.publishSolution(environment, solutionFilePath, solution));
    }

    private publishSolution(environment: string, solutionFilePath: string, solution: Solution): Promise<void> {
        let cwd = solutionFilePath.replace('shaman.json', '');
        let binPath = _path.join(cwd, 'bin/');
        let projects = solution.projects.filter(p => p.environment == environment);
        let projectNames = projects.map(p => p.name);
        if (!projects.length) return Promise.resolve();
        return this.environmentService.buildProject(solution.name, cwd)
            .then(_ => this.fileService.pathExists(`${binPath}dotnet`))
            .then(exists => { if (!exists) this.fileService.createFolder(binPath, 'dotnet') })
            .then(_ => projectNames.reduce((a, b) => a.then(_ => {
                let project = projects.find(p => p.name == b);
                let destinationPath = _path.join(cwd, `bin/dotnet/${project.path}`);
                return this.environmentService.publishProject(project.name, _path.join(cwd, project.path), destinationPath);
            }), Promise.resolve()))
            .then(_ => console.log("Dotnet projects published successfully..."));
    }

}