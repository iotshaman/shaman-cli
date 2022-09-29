import * as _path from 'path';
import { CommandLineArguments } from "../../command-line-arguments";
import { IChildCommand, ICommand } from "../../commands/command";
import { FileService, IFileService } from "../../services/file.service";
import { DotnetBuildCommand } from "./dotnet/dotnet-build.command";
import { NodeBuildCommand } from "./node/node-build.command";

export class BuildCommand implements ICommand {

  get name(): string { return "build"; }
  buildCommands: IChildCommand[] = [];
  fileService: IFileService = new FileService();
  childCommandFactory: (solutionFilePath: string, environment: string) => IChildCommand[];

  private environment;
  private solutionFilePath;

  constructor() {
    this.childCommandFactory = (solutionFilePath: string, environment: string): IChildCommand[] => {
      return [
        new NodeBuildCommand(solutionFilePath, environment),
        new DotnetBuildCommand(solutionFilePath)
      ]
    }
  }

  run = (cla: CommandLineArguments): Promise<void> => {
    this.assignArguments(cla);
    this.buildCommands = this.childCommandFactory(this.solutionFilePath, this.environment);
    if (this.environment != "*") return this.buildEnvironment(this.environment);
    let buildEnvironmentsTask = this.fileService.getShamanFile(this.solutionFilePath).then(solution => {
      let projectEnvironments = solution.projects.map(p => p.environment);
      let environmentSet = [...new Set(projectEnvironments)];
      return environmentSet.reduce((a, b) => a.then(_ => 
        this.buildEnvironment(b)
      ), Promise.resolve());
    });
    return buildEnvironmentsTask.then(_ => console.log("Solution build is complete."));
  }

  private buildEnvironment = (environment: string): Promise<void> => {
    let cmd = this.buildCommands.find(c => c.name == `build-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run();
  }

  private assignArguments = (cla: CommandLineArguments): void => {
    this.environment = cla.args['environment'] ? cla.args['environment'] : '*';
    this.solutionFilePath = cla.args['filePath'] ? cla.args['filePath'] : './shaman.json';
  }

}
