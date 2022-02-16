import * as _path from 'path';
import { ICommand } from '../command';
import { NodePublishCommand } from './node/node-publish.command';
import { DotnetPublishCommand } from './dotnet/dotnet-publish.command';
import { IFileService, FileService } from '../../services/file.service';

export class PublishCommand implements ICommand {
    
    get name(): string { return "publish" };
    publishCommands: ICommand[] = [
        new NodePublishCommand(),
        new DotnetPublishCommand()
    ];
    fileService: IFileService = new FileService();
    
    run = (environment: string = "*", solutionFilePath: string = "./shaman.json"): Promise<void> => {
        if (environment != "*") { /* TODO: implement */ } 
        let publishEnvironmentsTask = this.fileService.getShamanFile(solutionFilePath).then(solution => {
            let projectEnvironments = solution.projects.map(p => p.environment);
            let environmetsSet = [...new Set(projectEnvironments)];
            let cwd = solutionFilePath.replace("shaman.json", "");                        
            return this.fileService.pathExists(`${cwd}/bin`)
            .then(exists => { if (!exists) this.fileService.createFolder(cwd, "bin") })
            .then(_ =>  environmetsSet.reduce((a, b) => a.then(_ => 
                this.publishEnvironment(b, solutionFilePath)
            ), Promise.resolve()));                           
        });
        return publishEnvironmentsTask.then(_ => console.log("Solution publish is complete."));
    }
    
    private publishEnvironment(environment: string, solutionFilePath: string): Promise<void> {        
        let cmd = this.publishCommands.find(c => c.name == `publish-${environment}`);
        if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
        return cmd.run(environment, solutionFilePath);
    }    

}