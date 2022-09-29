import * as _path from 'path';
import * as _cmd from 'child_process';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { IChildCommand } from "../../command";
import { Solution, SolutionProject } from '../../../models/solution';

export class DotnetRunCommand implements IChildCommand {

  get name(): string { return "run-dotnet"; }
  waitForChildProcesses?: Promise<void>;
  private project: SolutionProject;

  constructor(
    private solution: Solution,
    private solutionFilePath: string
  ) { }
  
  assignProject = (project: SolutionProject) => {
    this.project = project;
  };

  run = (): Promise<void> => {
    if (!this.solution) return Promise.reject(new Error("Solution file has not been assigned to run command."));
    console.log(`Running dotnet run script for project ${this.project}.`);
    return this.spawnChildProcess(this.solutionFilePath, this.solution, this.project.name)
      .then(childProcess => {
        this.waitForChildProcesses = new Promise<void>((res) => childProcess.on('close', (_code) => res()));
      });
  }

  private spawnChildProcess = (solutionFilePath: string, solution: Solution, name: string): Promise<ChildProcessWithoutNullStreams> => {
    return new Promise((res, err) => {
      let solutionProject = solution.projects.find(p => p.name == name);
      if (!solutionProject) return err(new Error(`Invalid project '${name}'.`));
      let cwd = _path.join(solutionFilePath.replace('shaman.json', ''), solutionProject.path);
      let childProcess = _cmd.spawn("dotnet", ['run', "--no-build"], { cwd });
      childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
      childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
      res(childProcess);
    });
  }

}