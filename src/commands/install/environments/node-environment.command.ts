import * as _path from 'path';
import * as _cmd from 'child_process';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { Solution } from '../../../models/solution';

export class NodeEnvironmentInstallCommand implements ICommand {

  get name(): string { return "install-node"; }
  fileService: IFileService = new FileService();
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  run = (solutionFilePath: string): Promise<void> => {
    if (!solutionFilePath) solutionFilePath = _path.join(process.cwd(), 'shaman.json');
    else solutionFilePath = _path.join(process.cwd(), solutionFilePath);
    console.log(`Installing node solution.`);
    return this.getShamanFile(solutionFilePath)
      .then(solution => this.installSolution(solutionFilePath, solution))
      .then(_ => {
        console.log("Solution install is complete.");
      });
  }

  private getShamanFile = (solutionFilePath: string): Promise<Solution> => {
    return this.fileService.pathExists(solutionFilePath).then(exists => {
      if (!exists) throw new Error("Solution file does not exist in specified location.");
      return this.fileService.readJson<Solution>(solutionFilePath);
    });
  }

  private installSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    let cwd = solutionFilePath.replace('shaman.json', '');
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