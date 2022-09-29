import * as _path from 'path';
import * as _cmd from 'child_process';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { IChildCommand } from "../../command";
import { Solution, SolutionProject } from '../../../models/solution';

export class NodeRunCommand implements IChildCommand {

  get name(): string { return "run-node"; }
  waitForChildProcesses?: Promise<void>;
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  private project: SolutionProject;

  constructor(
    private script: string,
    private solution: Solution,
    private solutionFilePath: string
  ) { }

  assignProject = (project: SolutionProject) => {
    this.project = project;
  };

  run = (): Promise<void> => {
    if (!this.script) this.script = "start";
    if (!this.solution) return Promise.reject(new Error("Solution file has not been assigned to run command."));
    console.log(`Running node script '${this.script} for project ${this.project.name}.`);
    return this.spawnChildProcess(this.solutionFilePath, this.solution, this.project.name, this.script)
      .then(childProcess => {
        this.waitForChildProcesses = new Promise<void>((res) => childProcess.on('close', (_code) => res()));
      });
  }

  private spawnChildProcess = (solutionFilePath: string, solution: Solution, name: string, script: string): Promise<ChildProcessWithoutNullStreams> => {
    return new Promise((res, err) => {
      let solutionProject = solution.projects.find(p => p.name == name);
      if (!solutionProject) return err(new Error(`Invalid project '${name}'.`));
      let cwd = _path.join(solutionFilePath.replace('shaman.json', ''), solutionProject.path);
      let childProcess = _cmd.spawn(this.npm, ['run', script], { cwd });
      childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
      childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
      res(childProcess);
    });
  }

}