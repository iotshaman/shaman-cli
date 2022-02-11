import { ICommand } from "..";
import { Solution } from "../../models/solution";

export class PublishCommand implements ICommand {
    name: string;
    run: (...args: string[]) => Promise<void>;
    assignSolution?: (solution: Solution) => void;
    waitForChildProcesses?: Promise<void>;

}