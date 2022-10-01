import { ICommand } from "../command";

export class ScaffoldSolutionCommand implements ICommand {

  get name(): string { return "scaffold-solution"; }

  run = (): Promise<void> => {
    return Promise.reject(new Error("The scaffold-solution command has been deprecated. Please use the scaffold command instead."));
  }

}
