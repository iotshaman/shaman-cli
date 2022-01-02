import { ICommand } from "../../commands/command";
import { NodeEnvironmentInstallCommand } from './environments/node-environment.command';

export class InstallCommand implements ICommand {

  get name(): string { return "install"; }
  installCommands: ICommand[] = [
    new NodeEnvironmentInstallCommand()
  ]

  run = (environment: string, solutionFilePath: string): Promise<void> => {
    if (!environment) return Promise.reject(new Error("Environment argument not provided to scaffold command."));
    let cmd = this.installCommands.find(c => c.name == `install-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run(solutionFilePath);
  }

}