import * as _path from 'path';
import { spawn } from 'child_process';
import { Solution } from "../../models/solution";
import { IFileService } from "../file.service";

export interface IEnvironmentService {
  updateProjectDefinition: (folderPath: string, projectName: string, solution?: Solution) => Promise<void>;
  addProjectScaffoldFile: (folderPath: string, projectName: string, solution?: Solution) => Promise<void>;
  executeProjectScaffolding: (folderPath: string) => Promise<void>;
  installDependencies: (folderPath: string, projectName?: string) => Promise<void>;
  buildProject: (name: string, path: string) => Promise<void>;
  checkNamingConvention: (projectName: string, solutionName?: string) => Promise<void>;
}

export abstract class EnvironmentServiceBase implements IEnvironmentService {

  abstract fileService: IFileService;
  abstract updateProjectDefinition: (folderPath: string, projectName: string, solution: Solution) => Promise<void>;
  abstract installDependencies: (folderPath: string, projectName?: string) => Promise<void>;
  abstract buildProject: (name: string, path: string) => Promise<void>;
  abstract checkNamingConvention: (projectName: string, solutionName?: string,) => Promise<void>;

  addProjectScaffoldFile = (folderPath: string, projectName: string, solution: Solution): Promise<void> => {
    let project = solution?.projects.find(p => p.name == projectName);
    const scaffoldFile = {
      name: projectName,
      include: project?.include ?? [],
      specs: project?.specs ?? {}
    }
    let scaffoldFilePath = _path.join(folderPath, 'shaman.scaffold.json');
    return this.fileService.writeJson(scaffoldFilePath, scaffoldFile);
  }

  executeProjectScaffolding = (folderPath: string): Promise<void> => {
    let scaffoldCommand = new Promise((res, err) => {
      let childProcess = spawn('node', ['shaman.scaffold.js'], {cwd: folderPath});
      childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
      childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
      childProcess.on('close', (code) => code === 0 ? res(null) : err(
        new Error("An error occurred while executing project scaffolding.")
      ));
    });
    return scaffoldCommand.then(_ => this.fileService.deleteFile(_path.join(folderPath, 'shaman.scaffold.js')));
  }

}