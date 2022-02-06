import { ICommand } from "../../commands/command";
import { NodeScaffoldCommand } from "./node/node-scaffold.command";
import { DotnetScaffoldCommand } from "./dotnet/dotnet-scaffold.command";

export class ScaffoldCommand implements ICommand {

  get name(): string { return "scaffold"; }
  scaffoldCommands: ICommand[] = [
    new NodeScaffoldCommand(),
    new DotnetScaffoldCommand()
  ]

  run = (environment: string, projectType: string, name: string, output: string, language?: string): Promise<void> => {
    if (!environment) return Promise.reject(new Error("Environment argument not provided to scaffold command."));
    let cmd = this.scaffoldCommands.find(c => c.name == `scaffold-${environment}`);
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run(projectType, name, output, language);
  }

}