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
        console.log(`Publishing dotnet solution.`);     
        return this.fileService.getShamanFile(solutionFilePath)
        .then(solution => this.publishSolution(environment, solutionFilePath, solution));
    }
    
    publishSolution(environment: string, solutionFilePath: string, solution: Solution): Promise<void> {            
        // TODO: implement 
        throw new Error('Not implemented');        
    }
}