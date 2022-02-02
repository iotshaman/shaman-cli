import * as _path from 'path';
import { ISourceFactory } from './factories/source/source.factory';
import { NodeSourceFactory } from './factories/source/node-source.factory';
import { IFileService, FileService } from './services/file.service';
import { SourceFile } from './models/source-file';

// SETUP DEPENDENCIES
const fileService: IFileService = new FileService();
const sourceFactory: ISourceFactory = new NodeSourceFactory();
const projectFolder = "Z:\\Developers\\kbrown\\_sample\\shaman-cli-test\\scaffold-solution\\server";
const appConfigFilePath = `${projectFolder}\\src\\models\\app.config.ts`;
const appConfigFileOutputPath = `${projectFolder}\\src\\models\\app.config.ts`;
const compositionFilePath = `${projectFolder}\\src\\composition\\app.composition.ts`;
const compositionFileOutputPath = `${projectFolder}\\src\\composition\\app.composition.ts`;
const compositionTypesFilePath = `${projectFolder}\\src\\composition\\app.composition.types.ts`;
const compositionTypesFileOutputPath = `${projectFolder}\\src\\composition\\app.composition.types.ts`;

// TRANSFORM ALL FILES
const sourceGenerationTasks = [
  fileService.getSourceFile(appConfigFilePath).then(transformAppConfigFile),
  fileService.getSourceFile(compositionTypesFilePath).then(transformAppCompositionTypeFile),
  fileService.getSourceFile(compositionFilePath).then(transformAppCompositionFile)
]
Promise.all(sourceGenerationTasks).catch(ex => {
  console.error(ex.message);
  process.exit(1);
});

// TRANSFORM APP CONFIG FILE
function transformAppConfigFile(sourceFile: SourceFile): Promise<void> {
  const importHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "import");
  const configHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "config");
  if (!importHook) {
    console.log("No import hook found.");
    return Promise.resolve();
  }
  if (!configHook) {
    console.log("No config hook found.");
    return Promise.resolve();
  }
  const importLineFactory = () => {
    return sourceFactory.buildImportStatement(importHook, "mysql", ["PoolConfig"])
  };
  const buildAppConfigPropertyFactory = () => {
    return sourceFactory.buildClassProperty(configHook, "mysqlConfig: PoolConfig;")
  };
  sourceFile.replaceLines(importHook.index, importLineFactory);
  sourceFile.replaceLines(configHook.index, buildAppConfigPropertyFactory);
  return fileService.writeFile(appConfigFileOutputPath, sourceFile.toString());
}

// TRANSFORM APP COMPOSITION TYPES FILE
function transformAppCompositionTypeFile(sourceFile: SourceFile): Promise<void> {
  const compositionHook = sourceFile.transformationLines
    .filter(l => l.lifecycleHookData.args.type == "compose")
    .find(l => l.lifecycleHookData.args.target == "TYPES");

  if (!compositionHook) {
    console.log("No datacontext composition hook found.");
    return Promise.resolve();
  }

  const buildAppConfigPropertyFactory = () => {
    return sourceFactory.buildClassProperty(compositionHook, `MyDataContext: "MyDataContext",`)
  };
  sourceFile.replaceLines(compositionHook.index, buildAppConfigPropertyFactory);
  return fileService.writeFile(compositionTypesFileOutputPath, sourceFile.toString());
}

// TRANSFORM APP COMPOSITION FILE
function transformAppCompositionFile(sourceFile: SourceFile): Promise<void> {
  return importDataContext(sourceFile)
    .then(rslt => composeDataContext(rslt))
    .then(rslt => fileService.writeFile(compositionFileOutputPath, rslt.toString()))
    .then(_=> (null));
}

function importDataContext(sourceFile: SourceFile): Promise<SourceFile> {
  const importHook = sourceFile.transformationLines.find(l => l.lifecycleHookData.args.type == "import");
  if (!importHook) {
    console.log("No import hook found.");
    return Promise.resolve(sourceFile);
  }
  const lineFactory = () => {
    return sourceFactory.buildImportStatement(importHook, "sample-database", ["IMyDataContext", "MyDataContext"])
  };
  sourceFile.replaceLines(importHook.index, lineFactory);
  return Promise.resolve(sourceFile);
}

function composeDataContext(sourceFile: SourceFile): Promise<SourceFile> {
  const composeDataContextHook = sourceFile.transformationLines
    .filter(l => l.lifecycleHookData.args.type == "compose")
    .find(l => l.lifecycleHookData.args.target == "datacontext");

  if (!composeDataContextHook) {
    console.log("No datacontext composition hook found.");
    return Promise.resolve(sourceFile);
  }

  const lineFactory = () => sourceFactory.buildDataContextComposition(composeDataContextHook, "MyDataContext");
  sourceFile.replaceLines(composeDataContextHook.index, lineFactory);
  return Promise.resolve(sourceFile);
}