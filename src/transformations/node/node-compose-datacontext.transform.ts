import { ProjectTransformation, Solution } from "../../models/solution";
import { ITypescriptSourceService, TypescriptSourceService } from "../../services/source/typescript-source.service";
import { ITransformation } from "../transformation";

export class NodeComposeDataContextTransformation implements ITransformation {

  get name(): string { return "compose:datacontext"; }
  get environment(): string { return "node"; }
  sourceService: ITypescriptSourceService = new TypescriptSourceService();

  transform = (transformation: ProjectTransformation, solution: Solution, solutionFolderPath: string): Promise<void> => {
    return Promise.reject(new Error("Not implemented"));
  }

}