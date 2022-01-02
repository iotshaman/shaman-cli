import * as _path from 'path';
import * as _cmd from 'child_process';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { ShamanModel } from '../../../models/shaman.model';

export class NodeEnvironmentInstallCommand implements ICommand {

  get name(): string { return "install-node"; }
  fileService: IFileService = new FileService();
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  run = (shamanFilePath: string): Promise<void> => {
    if (!shamanFilePath) shamanFilePath = _path.join(process.cwd(), 'shaman.json');
    else shamanFilePath = _path.join(process.cwd(), shamanFilePath);
    console.log(`Installing node solution.`);
    return this.getShamanFile(shamanFilePath)
      .then(solution => this.installSolution(shamanFilePath, solution))
      .then(_ => {
        console.log("Solution install is complete.");
      });
  }

  private getShamanFile = (shamanFilePath: string): Promise<ShamanModel> => {
    return this.fileService.pathExists(shamanFilePath).then(exists => {
      if (!exists) throw new Error("Shaman file does not exist in specified location.");
      return this.fileService.readJson<ShamanModel>(shamanFilePath);
    });
  }

  private installSolution = (shamanFilePath: string, solution: ShamanModel): Promise<void> => {
    let cwd = shamanFilePath.replace('shaman.json', '');
    if (!solution.projects.length) return Promise.resolve();
    return solution.projects.reduce((a, b) => 
      a.then(_ => this.installProject(b.name, _path.join(cwd, b.path))), 
      Promise.resolve()
    );
  }

  private installProject = (name: string, path: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Installing project ${name}...`)
      _cmd.exec(`${this.npm} install`, { cwd: path}, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    })
  }

}