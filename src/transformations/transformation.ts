import { ProjectTransformation, Solution } from "../models/solution";

export interface ITransformation {
  name: string;
  environment: string;
  language?: string;
  transform: (transformation: ProjectTransformation, solution: Solution, solutionFolderPath: string) => Promise<void>;
}