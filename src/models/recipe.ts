import { ProjectTransformation, SolutionProject } from "./solution";

export class Recipe {
    projects: SolutionProject[];
    transform?: ProjectTransformation[];
}