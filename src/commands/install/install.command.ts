import { ICommand } from "../../commands/command";
import { FileService, IFileService } from "../../services/file.service";
import { DotnetInstallCommand } from "./dotnet/dotnet-install.command";
import { NodeInstallCommand } from './node/node-install.command';

export class InstallCommand implements ICommand {

  get name(): string { return "install"; }
  installCommands: ICommand[] = [
    new NodeInstallCommand(),
    new DotnetInstallCommand()
  ]
  fileService: IFileService = new FileService();

  run = (environment: string = "*", solutionFilePath: string = "./shaman.json"): Promise<void> => {
    if (environment != "*") return this.installEnvironment(environment, solutionFilePath);
    let installEnvironmentsTask = this.fileService.getShamanFile(solutionFilePath).then(solution => {
      let projectEnvironments = solution.projects.map(p => p.environment);
      let environmentSet = [...new Set(projectEnvironments)];
      return environmentSet.reduce((a, b) => a.then(_ => 
        this.installEnvironment(b, solutionFilePath)
      ), Promise.resolve());
    });
    return installEnvironmentsTask.then(_ => console.log("Solution install is complete."));
  }

  private installEnvironment = (environment: string, solutionFilePath: string): Promise<void> => {
    let cmd = this.installCommands.find(c => c.name == `install-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run(environment, solutionFilePath);
  }

}