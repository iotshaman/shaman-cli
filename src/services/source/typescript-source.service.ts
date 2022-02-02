import * as _path from 'path';
import { NodeSourceFactory } from "../../factories/source/node-source.factory";
import { ISourceFactory } from "../../factories/source/source.factory";
import { SolutionProject } from "../../models/solution";
import { FileService, IFileService } from '../file.service';

export interface ITypescriptSourceService {
  addMySqlAppConfiguration: (solutionFilePath: string, project: SolutionProject) => Promise<void>;
  addDataContextCompositionType: (solutionFilePath: string, project: SolutionProject, contextName: string) => Promise<void>;
  addDataContextComposition: (solutionFilePath: string, project: SolutionProject, 
    databaseProjectName: string, contextName: string) => Promise<void>;
}

export class TypescriptSourceService implements ITypescriptSourceService {

  fileService: IFileService = new FileService();
  sourceFactory: ISourceFactory = new NodeSourceFactory();

  addMySqlAppConfiguration = (solutionFilePath: string, project: SolutionProject): Promise<void> => {
    let projectFolderPath = _path.join(process.cwd(), solutionFilePath, project.path);
    let configFilePath = _path.join(projectFolderPath, 'src', 'models', 'app.config.ts');
    return this.fileService.getSourceFile(configFilePath).then(sourceFile => {
      const importHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "import");
      const configHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "config");
      if (!importHook) throw new Error("No import hook found in app config.");
      if (!configHook) throw new Error("No configuration hook found in app config.");
      const importLineFactory = () => {
        return this.sourceFactory.buildImportStatement(importHook, "mysql", ["PoolConfig"])
      };
      const buildAppConfigPropertyFactory = () => {
        return this.sourceFactory.buildClassProperty(configHook, "mysqlConfig: PoolConfig;")
      };
      sourceFile.replaceLines(importHook.index, importLineFactory);
      sourceFile.replaceLines(configHook.index, buildAppConfigPropertyFactory);
      return this.fileService.writeFile(configFilePath, sourceFile.toString());
    });
  }
  
  addDataContextCompositionType = (solutionFilePath: string, project: SolutionProject, contextName: string): Promise<void> => {
    let projectFolderPath = _path.join(process.cwd(), solutionFilePath, project.path);
    let typesFilePath = _path.join(projectFolderPath, 'src', 'composition', 'app.composition.types.ts');
    return this.fileService.getSourceFile(typesFilePath).then(sourceFile => {
      const compositionHook = sourceFile.transformationLines
        .filter(l => l.lifecycleHookData.args.type == "compose")
        .find(l => l.lifecycleHookData.args.target == "TYPES");
      if (!compositionHook) throw new Error("No composition hook found TYPES objects.");
      const buildAppConfigPropertyFactory = () => {
        return this.sourceFactory.buildClassProperty(compositionHook, `${contextName}: "${contextName}",`)
      };
      sourceFile.replaceLines(compositionHook.index, buildAppConfigPropertyFactory);
      return this.fileService.writeFile(typesFilePath, sourceFile.toString());
    });
  }

  addDataContextComposition = (solutionFilePath: string, project: SolutionProject, 
    databaseProjectName: string, contextName: string): Promise<void> => {
    let projectFolderPath = _path.join(process.cwd(), solutionFilePath, project.path);
    let compositionFilePath = _path.join(projectFolderPath, 'src', 'composition', 'app.composition.ts');
    return this.fileService.getSourceFile(compositionFilePath).then(sourceFile => {
      const importHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "import");
      const compositionHook = sourceFile.transformationLines
        .filter(l => l.lifecycleHookData.args.type == "compose")
        .find(l => l.lifecycleHookData.args.target == "datacontext");
      if (!importHook) throw new Error("No import hook found in composition file.");
      if (!compositionHook) throw new Error("No data context composition hook found in composition file.");
      const importLineFactory = () => {
        return this.sourceFactory.buildImportStatement(importHook, databaseProjectName, [`I${contextName}`, contextName])
      };
      const composeLineFactory = () => this.sourceFactory.buildDataContextComposition(compositionHook, "MyDataContext");
      sourceFile.replaceLines(importHook.index, importLineFactory);
      sourceFile.replaceLines(compositionHook.index, composeLineFactory);
      return this.fileService.writeFile(compositionFilePath, sourceFile.toString());
    });
  }

}