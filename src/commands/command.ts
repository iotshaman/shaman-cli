import { CommandLineArguments } from "../command-line-arguments";
import { SolutionProject } from "../models/solution";

export interface ICommand {
  name: string;
  run: (cla: CommandLineArguments) => Promise<void>;
  waitForChildProcesses?: Promise<void>;
}

export interface IChildCommand {
  name: string;
  run: () => Promise<void>;
  assignProject?: (project: SolutionProject) => void;
  waitForChildProcesses?: Promise<void>;
}
