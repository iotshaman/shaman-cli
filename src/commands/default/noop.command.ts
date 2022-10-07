import { CommandLineArguments } from "../../command-line-arguments";
import { ICommand } from "../command";

export class NoopCommand implements ICommand {

  get name(): string { return "noop"; }

  run = (_cla: CommandLineArguments): Promise<void> => {
    return Promise.resolve();
  }
}