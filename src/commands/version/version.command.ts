import * as __path from "path";
import { ICommand } from "..";
import { Solution } from "../../models/solution";
import { IFileService, FileService } from "../../services/file.service";

export class VersionCommand implements ICommand {
    get name(): string { return "--version"; }

    fileservice: IFileService = new FileService();
    
    run = (): Promise<void> => {
        let path = __path.join(__dirname, '../../..', 'package.json');
        return this.fileservice.readJson<{version: string}>(path).then(rslt => {
            console.log(`shaman-cli version ${rslt.version}`)
        });
    };
} 