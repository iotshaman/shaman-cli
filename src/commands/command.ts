import { Solution, SolutionProject } from "..";

export interface ICommand {
  name: string;
  run: (...args: string[]) => Promise<void>;
  assignSolution?: (solution: Solution) => void;
  assignProject? : (project: SolutionProject) => void;
  waitForChildProcesses?: Promise<void>;
}