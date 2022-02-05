import * as _path from 'path';
import * as _cmd from 'child_process';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { ICommand } from "../../command";
import { Solution } from '../../../models/solution';

export class NodeRunCommand implements ICommand {
  
  get name(): string { return "run-node"; }
  waitForChildProcesses?: Promise<void>;
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  private solution: Solution;

  assignSolution = (solution: Solution) => {
    this.solution = solution;
  }

  run = (project: string, script: string, solutionFilePath: string): Promise<void> => {
    if (!script) script = "start";
    if (!this.solution) return Promise.reject(new Error("Solution file has not been assigned to run command."));
    console.log(`Running node script '${script} for project ${project}.`);
    return this.spawnChildProcess(solutionFilePath, this.solution, project, script)
      .then(childProcess => {
        this.waitForChildProcesses = new Promise<void>((res) => childProcess.on('close', (_code) => res()));
      });
  }

  private spawnChildProcess = (solutionFilePath: string, solution: Solution, project: string, script: string): Promise<ChildProcessWithoutNullStreams> => {
    return new Promise((res, err) => {
      let solutionProject = solution.projects.find(p => p.name == project);
      if (!solutionProject) return err(new Error(`Invalid project '${project}'.`));
      let cwd = _path.join(solutionFilePath.replace('shaman.json', ''), solutionProject.path);
      let childProcess = _cmd.spawn(this.npm, ['run', script], {cwd});
      childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
      childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
      res(childProcess);
    });
  }

}