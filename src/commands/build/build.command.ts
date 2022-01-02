import { ICommand } from "../../commands/command";
import { NodeEnvironmentBuildCommand } from "./environments/node-environment.command";

export class BuildCommand implements ICommand {

  get name(): string { return "build"; }
  buildCommands: ICommand[] = [
    new NodeEnvironmentBuildCommand()
  ]

  run = (environment: string, location: string): Promise<void> => {
    if (!environment) return Promise.reject(new Error("Environment argument not provided to scaffold command."));
    let cmd = this.buildCommands.find(c => c.name == `build-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run(location);
  }

}