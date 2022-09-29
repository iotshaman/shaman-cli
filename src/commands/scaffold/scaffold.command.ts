import { ICommand } from "../../commands/command";

export class ScaffoldCommand implements ICommand {

  get name(): string { return "scaffold"; }

  run = (): Promise<void> => {
    return Promise.reject(new Error("The scaffold command has been deprecated. Please use the scaffold-solution command instead."));
  }

}
