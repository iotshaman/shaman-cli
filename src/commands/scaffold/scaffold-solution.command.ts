import { CommandLineArguments } from "../../command-line-arguments";
import { ICommand } from "../command";

export class ScaffoldSolutionCommand implements ICommand {

  get name(): string { return "scaffold-solution"; }

  run = (_cla: CommandLineArguments): Promise<void> => {
    return Promise.reject(new Error("The scaffold-solution command has been deprecated. Please use the scaffold command instead."));
  }

}
