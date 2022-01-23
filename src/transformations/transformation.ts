import { ProjectTransformation, Solution } from "../models/solution";

export interface ITransformation {
  name: string;
  transform: (transformation: ProjectTransformation, solution: Solution, cwd: string) => Promise<void>;
}