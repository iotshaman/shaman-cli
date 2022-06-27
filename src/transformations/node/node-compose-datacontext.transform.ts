import { ProjectTransformation, Solution } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { ITypescriptSourceService, TypescriptSourceService } from "../../services/source/typescript-source.service";
import { ITransformation } from "../transformation";

export class NodeComposeDataContextTransformation implements ITransformation {

  get name(): string { return "compose:datacontext"; }
  get environment(): string { return "node"; }
  get language(): string { return "typescript"; }
  fileService: IFileService = new FileService();
  sourceService: ITypescriptSourceService = new TypescriptSourceService();

  transform = (transformation: ProjectTransformation, solution: Solution, solutionFolderPath: string): Promise<void> => {
    const project = solution.projects.find(p => p.name == transformation.targetProject);
    if (!project) return Promise.reject(new Error(`Invalid target project in transformation: '${transformation.targetProject}'.`));
    let databaseProject = solution.projects.find(p => p.name == transformation.sourceProject);
    if (!databaseProject) return Promise.reject(new Error(`Invalid source project in transformation: '${transformation.sourceProject}'.`));
    const contextName = databaseProject.specs?.contextName ?? "SampleDatabaseContext";
    return this.sourceService.doesDataContextCompositionExist(solutionFolderPath, project, contextName)
      .then(_ => this.sourceService.addMySqlAppConfigurationJson(solutionFolderPath, project))
      .then(_ => this.sourceService.addMySqlAppConfigurationModel(solutionFolderPath, project))
      .then(_ => this.sourceService.addDataContextCompositionType(solutionFolderPath, project, contextName))
      .then(_ => this.sourceService.addDataContextComposition(solutionFolderPath, project, databaseProject.name, contextName))
      .catch(err => console.log(err.message));
  }

}