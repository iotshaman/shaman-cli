import * as _path from 'path';
import { ICommand } from "../../commands/command";
import { IFileService, FileService } from "../../services/file.service";
import { Solution, SolutionProject } from "../../models/solution";
import { NodeEnvironmentScaffoldCommand } from './environments/node-environment.command';

export class ScaffoldSolutionCommand implements ICommand {

  get name(): string { return "scaffold-solution"; }
  fileService: IFileService = new FileService();
  scaffoldCommands: ICommand[] = [
    new NodeEnvironmentScaffoldCommand()
  ]

  run = (solutionFilePath: string): Promise<void> => {
    if (!solutionFilePath) solutionFilePath = './shaman.json'
    return this.getShamanFile(solutionFilePath)
      .then(solution => this.buildSolution(solutionFilePath, solution))
      .then(_ => {
        console.log("Solution scaffolding is complete.");
      });
  }

  private getShamanFile = (solutionFilePath: string): Promise<Solution> => {
    let fullPath = _path.join(process.cwd(), solutionFilePath);
    return this.fileService.pathExists(fullPath).then(exists => {
      if (!exists) throw new Error("Shaman file does not exist in specified location.");
      return this.fileService.readJson<Solution>(solutionFilePath);
    });
  }

  private buildSolution = (solutionFilePath: string, solution: Solution): Promise<void> => {
    let cwd = solutionFilePath.replace('shaman.json', '');
    if (!solution.projects.length) {
      console.warn("No projects found in shaman solution file.");
      return Promise.resolve();
    }
    return solution.projects.reduce((a, b) => 
      a.then(_ => this.buildProject(b, cwd)), 
      Promise.resolve()
    );
  }

  private buildProject = (project: SolutionProject, cwd: string): Promise<void> => {    
    let cmd = this.scaffoldCommands.find(c => c.name == `scaffold-${project.environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${project.environment}'.`));
    return cmd.run(project.type, project.name, _path.join(cwd, project.path));
  }

}