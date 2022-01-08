import * as _path from 'path';
import * as _cmd from 'child_process';
import { ICommand } from "../../command";
import { FileService, IFileService } from '../../../services/file.service';
import { Solution } from '../../../models/solution';

export class NodeEnvironmentRunCommand implements ICommand {
  
  get name(): string { return "run-node"; }
  fileService: IFileService = new FileService();
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  run = (project: string, script: string, solutionFilePath: string): Promise<void> => {
    if (!script) script = "start";
    console.log(`Running node script '${script} for project ${project}.`);
    return this.getShamanFile(solutionFilePath)
      .then(solution => this.spawnChildProcess(solutionFilePath, solution, project, script))
      .then(_ => {
        console.log("Node script has completed.");
      });
  }

  private getShamanFile = (solutionFilePath: string): Promise<Solution> => {
    return this.fileService.pathExists(solutionFilePath).then(exists => {
      if (!exists) throw new Error("Solution file does not exist in specified location.");
      return this.fileService.readJson<Solution>(solutionFilePath);
    });
  }

  private spawnChildProcess = (solutionFilePath: string, solution: Solution, project: string, script: string): Promise<void> => {
    return new Promise((res, err) => {
      let solutionProject = solution.projects.find(p => p.name == project);
      if (!solutionProject) return err(new Error(`Invalid project '${project}'.`));
      let cwd = _path.join(solutionFilePath.replace('shaman.json', ''), solutionProject.path);
      let childProcess = _cmd.spawn(this.npm, ['run', script], {cwd});
      childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
      childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
      childProcess.on('close', (_code) => res());
    });
  }

}