import * as __path from "path";
import { ICommand } from "..";
import { IFileService, FileService } from "../../services/file.service";

export class VersionCommand implements ICommand {
    get name(): string { return "--version"; }

    fileService: IFileService = new FileService();

    run = (): Promise<void> => {
        let path = __path.join(__dirname, '../../..', 'package.json');
        return this.getPackageFile(path)
        .then(rslt => {            
            console.log(`shaman-cli version ${rslt.version}`);
        });
    };

    private getPackageFile = (packageFilePath: string): Promise<{version:string}> => {
        return this.fileService.pathExists(packageFilePath).then(exists => {
            if (!exists) throw new Error("Package file is not in the default location.");
            return this.fileService.readJson<{version: string}>(packageFilePath);
        })
    }
} 