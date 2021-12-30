import { ICommand } from "../command";

export class EchoCommand implements ICommand {

  get name(): string { return "echo"; }

  run = (echo: string = "No echo string provided."): Promise<void> => {
    console.log(`Echo: ${echo}`);
    return Promise.resolve();
  }
}