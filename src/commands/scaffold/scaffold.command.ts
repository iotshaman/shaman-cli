import { ICommand } from "../../commands/command";
import { NodeScaffoldCommand } from "./node/node-scaffold.command";
import { DotnetScaffoldCommand } from "./dotnet/dotnet-scaffold.command";
import { deprecate } from "util";

export class ScaffoldCommand implements ICommand {

  get name(): string { return "scaffold"; }
  scaffoldCommands: ICommand[] = [
    new NodeScaffoldCommand(),
    new DotnetScaffoldCommand()
  ]

  run = (environment: string, projectType: string, name: string, output: string, language?: string): Promise<void> => {
    return Promise.reject(new Error("The scaffold command has been deprecated. Please use the scaffold-solution command instead."));
  }

}