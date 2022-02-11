import * as _path from 'path';
import { ICommand } from "../command";
import { NodePublishCommand } from "./node/node-publish.command";
import { DotnetPublishCommand } from "./dotnet/dotnet-publish.command"
import { IFileService, FileService } from "../../services/file.service";
import { promisify } from 'util';

export class PublishCommand implements ICommand {
    
    get name(): string { return "publish" };
    publishCommands: ICommand[] = [
        new NodePublishCommand(),
        new DotnetPublishCommand()
    ];
    fileService: IFileService = new FileService();
    
    run = (environment: string = "*", solutionFilePath: string = "./shaman.json"): Promise<void> => {
        if (environment != "*") { 
            // TODO: implement
        } 
        let publishEnvironmentsTask = this.fileService.getShamanFile(solutionFilePath).then(solution => {
            let projectEnvironments = solution.projects.map(p => p.environment);
            let environmetsSet = [...new Set(projectEnvironments)];
            this.createBinFile(solutionFilePath);
            return environmetsSet.reduce((a, b) => a.then(_ => {
                this.publishEnvironment(b, solutionFilePath)
            }), Promise.resolve());
        });
        return publishEnvironmentsTask.then(_ => console.log("Solution publish is complete."));
    }
    
    private publishEnvironment(environment: string, solutionFilePath: string): Promise<void> {
        
        // TODO: implement method
        return Promise.resolve();
    }
    
    private createBinFile(solutionFilePath: string): Promise<void> {
        let cwd = solutionFilePath.replace('shaman.json', '');
        return this.fileService.pathExists(`${cwd}/bin`).then(exists => {
            if (!exists) this.fileService.createFolder(cwd, "bin");
        }).then(_ => Promise.resolve());
    }

}