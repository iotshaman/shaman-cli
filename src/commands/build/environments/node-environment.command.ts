import * as _path from 'path';
import * as _cmd from 'child_process';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { ShamanModel } from '../../../models/shaman.model';

export class NodeEnvironmentBuildCommand implements ICommand {

  get name(): string { return "build-node"; }
  fileService: IFileService = new FileService();
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  run = (shamanFilePath: string): Promise<void> => {
    if (!shamanFilePath) shamanFilePath = _path.join(process.cwd(), 'shaman.json');
    else shamanFilePath = _path.join(process.cwd(), shamanFilePath);
    console.log(`Building node solution.`);
    return this.getShamanFile(shamanFilePath)
      .then(solution => this.buildSolution(shamanFilePath, solution))
      .then(_ => {
        console.log("Solution build is complete.");
      });
  }

  private getShamanFile = (shamanFilePath: string): Promise<ShamanModel> => {
    return this.fileService.pathExists(shamanFilePath).then(exists => {
      if (!exists) throw new Error("Shaman file does not exist in specified location.");
      return this.fileService.readJson<ShamanModel>(shamanFilePath);
    });
  }

  private buildSolution = (shamanFilePath: string, solution: ShamanModel): Promise<void> => {
    let cwd = shamanFilePath.replace('shaman.json', '');
    if (!solution.projects.length) return Promise.resolve();
    return solution.projects.reduce((a, b) => 
      a.then(_ => this.buildProject(b.name, _path.join(cwd, b.path))), 
      Promise.resolve()
    );
  }

  private buildProject = (name: string, path: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Building project ${name}...`)
      _cmd.exec(`${this.npm} run build`, { cwd: path}, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    })
  }

}