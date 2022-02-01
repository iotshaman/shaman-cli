import { ICommand } from "../../commands/command";
import { NodeBuildCommand } from "./node/node-build.command";

export class BuildCommand implements ICommand {

  get name(): string { return "build"; }
  buildCommands: ICommand[] = [
    new NodeBuildCommand()
  ]

  run = (environment: string, solutionFilePath: string): Promise<void> => {
    if (!environment) return Promise.reject(new Error("Environment argument not provided to build command."));
    let cmd = this.buildCommands.find(c => c.name == `build-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run(solutionFilePath);
  }

}