import { ICommand } from "../../commands/command";
import { FileService, IFileService } from "../../services/file.service";
import { NodeBuildCommand } from "./node/node-build.command";

export class BuildCommand implements ICommand {

  get name(): string { return "build"; }
  buildCommands: ICommand[] = [
    new NodeBuildCommand()
  ]
  fileService: IFileService = new FileService();

  run = (environment: string = "*", solutionFilePath: string = "./shaman.json"): Promise<void> => {
    if (environment != "*") return this.buildEnvironment(environment, solutionFilePath);
    let buildEnvironmentsTask = this.fileService.getShamanFile(solutionFilePath).then(solution => {
      let projectEnvironments = solution.projects.map(p => p.environment);
      let environmentSet = [...new Set(projectEnvironments)];
      return environmentSet.reduce((a, b) => a.then(_ => 
        this.buildEnvironment(b, solutionFilePath)
      ), Promise.resolve());
    });
    return buildEnvironmentsTask.then(_ => (null));
  }

  private buildEnvironment = (environment: string, solutionFilePath: string): Promise<void> => {
    let cmd = this.buildCommands.find(c => c.name == `build-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run(environment, solutionFilePath);
  }

}