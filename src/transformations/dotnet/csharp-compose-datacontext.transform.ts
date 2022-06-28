import { ProjectTransformation, Solution } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { ICsharpSourceService, CsharpSourceService } from "../../services/source/csharp-source.service";
import { ITransformation } from "../transformation";

export class CsharpComposeDataContextTransformation implements ITransformation {

  get name(): string { return "compose:datacontext"; }
  get environment(): string { return "dotnet"; }
  get language(): string { return "csharp"; }
  fileService: IFileService = new FileService();
  sourceService: ICsharpSourceService = new CsharpSourceService();

  transform = (transformation: ProjectTransformation, solution: Solution, solutionFolderPath: string): Promise<void> => {
    const project = solution.projects.find(p => p.name == transformation.targetProject);
    if (!project) return Promise.reject(new Error(`Invalid target project in transformation: '${transformation.targetProject}'.`));
    let databaseProject = solution.projects.find(p => p.name == transformation.sourceProject);
    if (!databaseProject) return Promise.reject(new Error(`Invalid source project in transformation: '${transformation.sourceProject}'.`));
    const contextName = databaseProject.specs?.contextName ?? "SampleDataContext";
    return this.sourceService.addDatabaseConnectionStringToAppsettingsJson(solutionFolderPath, project, contextName)
      .then(_ => this.sourceService.addConnectionStringToAppConfig(solutionFolderPath, project, contextName))
      .then(_ => this.sourceService.addDataContextComposition(solutionFolderPath, project, databaseProject.name, contextName));
  }
  
}
