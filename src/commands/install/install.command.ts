import { CommandLineArguments } from "../../command-line-arguments";
import { ICommand, IChildCommand } from "../../commands/command";
import { FileService, IFileService } from "../../services/file.service";
import { DotnetInstallCommand } from "./dotnet/dotnet-install.command";
import { NodeInstallCommand } from './node/node-install.command';

export class InstallCommand implements ICommand {

  get name(): string { return "install"; }
  installCommands: IChildCommand[] = [];
  fileService: IFileService = new FileService();
  childCommandFactory: (solutionFilePath: string, environment: string) => IChildCommand[];

  private environment;
  private solutionFilePath;

  constructor() {
    this.childCommandFactory = (solutionFilePath: string, environment: string): IChildCommand[] => {
      return [
        new NodeInstallCommand(solutionFilePath, environment),
        new DotnetInstallCommand(solutionFilePath)
      ]
    }
  }

  run = (cla: CommandLineArguments): Promise<void> => {
    this.assignArguments(cla);
    this.installCommands = this.childCommandFactory(this.solutionFilePath, this.environment);
    if (this.environment != "*") return this.installEnvironment(this.environment);
    let installEnvironmentsTask = this.fileService.getShamanFile(this.solutionFilePath).then(solution => {
      let projectEnvironments = solution.projects.map(p => p.environment);
      let environmentSet = [...new Set(projectEnvironments)];
      return environmentSet.reduce((a, b) => a.then(_ =>
        this.installEnvironment(b)
      ), Promise.resolve());
    });
    return installEnvironmentsTask.then(_ => console.log("Solution install is complete."));
  }

  private installEnvironment = (environment: string): Promise<void> => {
    let cmd = this.installCommands.find(c => c.name == `install-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run();
  }

  private assignArguments = (cla: CommandLineArguments) => {
    this.environment = cla.args["environment"] ? cla.args["environment"] : "*";
    this.solutionFilePath = cla.args["filePath"] ? cla.args["filePath"] : "./shaman.json";
  }

}
