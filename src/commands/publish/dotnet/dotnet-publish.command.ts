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

    run = (_environment: string, solutionFilePath: string): Promise<void> => {
        if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
        else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
        console.log(`Publishing dotnet solutions...`);
        return this.fileService.getShamanFile(solutionFilePath)
            .then(solution => this.publishSolution(solutionFilePath, solution));
    }

    private publishSolution(solutionFilePath: string, solution: Solution): Promise<void> {
        // NOTE: create /bin/dotnet directory
        let binPath = solutionFilePath.replace('shaman.json', 'bin/');
        this.fileService.pathExists(`${binPath}dotnet`)
            .then(exists => { if (!exists) this.fileService.createFolder(binPath, 'dotnet') }); 
        // TODO: remove if not needed
        if (!solution.projects.some(p => p.environment == "dotnet")) {
            console.log("No dotnet project detected, skipping dotnet build.");
            return Promise.resolve();
        }
        //
        let solutionFolderPath = solutionFilePath.replace('shaman.json', '');
        let destinationPath = solutionFilePath.replace('shaman.json', 'bin/dotnet');
        return this.environmentService.publishProject(solution.name, solutionFolderPath, destinationPath);
    }

}