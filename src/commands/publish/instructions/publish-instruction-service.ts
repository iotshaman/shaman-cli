import { Solution, SolutionProject } from "../../..";

export interface IPublishInstructionService {
  instruction: string;
  processInstruction: (cwd: string, solution: Solution, project: SolutionProject) => Promise<void>;
}