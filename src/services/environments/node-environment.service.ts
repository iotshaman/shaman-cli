import * as _path from 'path';
import { exec, spawn } from 'child_process';

import { IEnvironmentService } from "./environment.service";
import { Solution } from '../../models/solution';
import { FileService, IFileService } from '../file.service';

export class NodeEnvironmentService implements IEnvironmentService {

  fileService: IFileService = new FileService();
  /* istanbul ignore next */
  private npm: string = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  updateProjectDefinition = (folderPath: string, projectName: string, solution: Solution): Promise<void> => {
    let packagePath = _path.join(folderPath, 'package.json');
    return this.fileService.readJson<any>(packagePath).then(pkg => {
      pkg.name = projectName;
      let project = solution?.projects.find(p => p.name == projectName);
      if (!!project?.include?.length) {
        project.include.forEach(dep => {
          let dependentProject = solution.projects.find(p => p.name == dep);
          if (!dependentProject) throw new Error(`Invalid dependency '${dep}'`);
          if (!pkg.dependencies) pkg.dependencies = {};
          pkg.dependencies[dep] = `file:${_path.join('../', dependentProject.path)}`;
        });
      }
      return this.fileService.writeJson(packagePath, pkg);
    });
  }

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

  installDependencies = (folderPath: string, projectName: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Installing dependencies for project '${projectName}'...`)
      exec(`${this.npm} install`, { cwd: folderPath}, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    })
  }

  buildProject = (name: string, path: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Building project '${name}'...`)
      exec(`${this.npm} run build`, { cwd: path}, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    });
  }

}