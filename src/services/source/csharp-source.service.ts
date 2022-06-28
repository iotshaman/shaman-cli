import * as _path from 'path';
import { ISourceFactory } from "../../factories/source/source.factory";
import { SolutionProject } from "../../models/solution";
import { FileService, IFileService } from '../file.service';
import { CsharpSourceFactory } from '../../factories/source/csharp-source.factory';

export interface ICsharpSourceService {
  checkIfComposed: (solutionFolderPath: string, project: SolutionProject, 
    contextName: string) => Promise<boolean>;
  addDatabaseConnectionStringToAppsettingsJson: (solutionFolderPath: string,
    project: SolutionProject, contextName: string) => Promise<void>;
  addConnectionStringToAppConfig: (solutionFolderPath: string, project: SolutionProject,
    contextName: string) => Promise<void>;
  addDataContextComposition: (solutionFolderPath: string, project: SolutionProject,
    databaseProjectName: string, contextName: string) => Promise<void>;
}

export class CsharpSourceService implements ICsharpSourceService {

  fileService: IFileService = new FileService();
  sourceFactory: ISourceFactory = new CsharpSourceFactory();

  checkIfComposed = (solutionFolderPath: string, project: SolutionProject, 
    contextName: string): Promise<boolean> => {
    const projectFolderPath = _path.join(process.cwd(), solutionFolderPath, project.path);
    const compositionFilePath = _path.join(projectFolderPath, 'Composition', 'ServiceCollectionExtensions.cs');
    return new Promise((resolve, _reject) => {
      this.fileService.getSourceFile(compositionFilePath, 4).then(sourceFile => {
        sourceFile.lines.forEach(l => {
          // console.log(l.content.includes(contextName)); // NOTE: remove
          if (l.content.includes(contextName)) resolve(true);
        });
        resolve(false);
      });
    });
  }

  addDatabaseConnectionStringToAppsettingsJson = (solutionFolderPath: string,
    project: SolutionProject, contextName: string): Promise<void> => {
    const projectFolderPath = _path.join(process.cwd(), solutionFolderPath, project.path);
    const appConfigFilePath = _path.join(projectFolderPath, 'appsettings.json');
    const devConfigFilePath = _path.join(projectFolderPath, 'appsettings.Development.json');
    const updateConfigFileTask = this.fileService.readJson<{ AppConfig: any }>(appConfigFilePath).then(config => {
      config.AppConfig[`${contextName}ConnectionString`] = "";
      return this.fileService.writeJson(appConfigFilePath, config);
    });
    const updateSampleConfigFileTask = this.fileService.readJson<{ AppConfig: any }>(devConfigFilePath).then(config => {
      config.AppConfig[`${contextName}ConnectionString`] = "";
      return this.fileService.writeJson(devConfigFilePath, config);
    });
    return Promise.all([updateConfigFileTask, updateSampleConfigFileTask]).then(_ => (null));
  }

  addConnectionStringToAppConfig = (solutionFolderPath: string, project: SolutionProject,
    contextName: string): Promise<void> => {
    const projectFolderPath = _path.join(process.cwd(), solutionFolderPath, project.path);
    const configFilePath = _path.join(projectFolderPath, 'Configuration', 'AppConfig.cs');
    return this.fileService.getSourceFile(configFilePath, 4).then(sourceFile => {
      const configHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "config");
      if (!configHook) throw new Error("No configuration hook found in app config.");
      const buildAppConfigPropertyFactory = () => {
        return this.sourceFactory.buildClassProperty(configHook, `${contextName}ConnectionString`, "string")
      };
      sourceFile.replaceLines(configHook.index, buildAppConfigPropertyFactory);
      return this.fileService.writeFile(configFilePath, sourceFile.toString());
    });
  }

  addDataContextComposition = (solutionFolderPath: string, project: SolutionProject,
    databaseProjectName: string, contextName: string): Promise<void> => {
    const projectFolderPath = _path.join(process.cwd(), solutionFolderPath, project.path);
    const compositionFilePath = _path.join(projectFolderPath, 'Composition', 'ServiceCollectionExtensions.cs');
    return this.fileService.getSourceFile(compositionFilePath, 4).then(sourceFile => {
      const importHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "import");
      const compositionHook = sourceFile.transformationLines
        .filter(l => l.lifecycleHookData.args.type == "compose")
        .find(l => l.lifecycleHookData.args.target == "datacontext");
      if (!importHook) throw new Error("No import hook found in composition file.");
      if (!compositionHook) throw new Error("No data context composition hook found in composition file.");
      const importLineFactory = () => {
        let importTypes = ["System", "Microsoft.Extensions.Options", "Microsoft.EntityFrameworkCore", databaseProjectName]
        return this.sourceFactory.buildImportStatement(importHook, null, importTypes)
      };
      const composeLineFactory = () => this.sourceFactory.buildDataContextComposition(compositionHook, contextName);
      sourceFile.replaceLines(importHook.index, importLineFactory);
      sourceFile.replaceLines(compositionHook.index, composeLineFactory);
      return this.fileService.writeFile(compositionFilePath, sourceFile.toString());
    });
  }

}