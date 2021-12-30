import { ICommand } from "./command";

export class NoopCommand implements ICommand {

  get name(): string { return "noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}