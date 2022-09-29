import { CommandLineArguments } from "../../command-line-arguments";
import { ICommand } from "../command";

export class EchoCommand implements ICommand {

  get name(): string { return "echo"; }

  run = (cla: CommandLineArguments): Promise<void> => {
    let echo = cla.args['string'] ? cla.args['string'] : 'No echo string provided.';
    console.log(`Echo: ${echo}`);
    return Promise.resolve();
  }
}