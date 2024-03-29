import * as _path from 'path';
import { exec, spawn } from "child_process";
import { EnvironmentServiceBase } from "./environment.service";
import { Solution } from '../../models/solution';
import { FileService, IFileService } from '../file.service';

export class DotnetEnvironmentService extends EnvironmentServiceBase {

  fileService: IFileService = new FileService();

  updateProjectDefinition = (folderPath: string, projectName: string, solution: Solution): Promise<void> => {
    let updateProjectTask = Promise.resolve();
    let project = solution.projects.find(p => p.name == projectName);
    if (!!project.include?.length) {
      const childProcessPromiseFactory = (dep: string): Promise<void> => {
        return new Promise((res, err) => {
          let dependentProject = solution.projects.find(p => p.name == dep);
          if (!dependentProject) throw new Error(`Invalid dependency '${dep}'.`);
          let dependendProjectFilePath = _path.join("..", dependentProject.path, `${dep}.csproj`);
          let childProcess = spawn('dotnet', ["add", "reference", dependendProjectFilePath], {cwd: folderPath});
          childProcess.stdout.on('data', (data) => process.stdout.write(`${data}`));
          childProcess.stderr.on('data', (data) => process.stderr.write(`${data}`));
          childProcess.on('close', (code) => code === 0 ? res(null) : err(
            new Error("An error occurred while adding dotnet project dependency.")
          ));
        })
      }
      updateProjectTask = project.include.reduce((a, b) =>
        a.then(_ => childProcessPromiseFactory(b)),
        Promise.resolve());
    }
    return updateProjectTask.then(_ => {
      let defaultProjecFilePath = _path.join(folderPath, `shaman.${ project.language ?? "csharp"}.csproj`);
      let newProjectFilePath = _path.join(folderPath, `${projectName}.csproj`);
      return this.fileService.renameFile(defaultProjecFilePath, newProjectFilePath);
    });
  }

  installDependencies = (folderPath: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Installing dotnet dependencies...`)
      exec(`dotnet restore`, { cwd: folderPath }, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    })
  }

  buildProject = (_name: string, path: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Building dotnet projects...`)
      exec(`dotnet build`, { cwd: path}, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    });
  }

  checkNamingConvention = (projectName: string, solutionName: string): Promise<void> => {
    if (!solutionName) return Promise.reject(new Error("Dotnet solutions require a name, please update your shaman.json file."));
    let namingConvention = new RegExp('^[A-Z][a-zA-Z]*$');
    if (!namingConvention.test(solutionName)) {
      let recommendedName = solutionName.charAt(0).toUpperCase() + solutionName.slice(1);
      return Promise.reject(
        new Error(`Solution name "${solutionName}" does not meet proper dotnet naming conventions. ` + 
        `It's recommended that the solution name be changed to "${recommendedName}".`
        ));
    }
    if (!namingConvention.test(projectName)) {
      let recommendedName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
      return Promise.reject(
        new Error(`Project name "${projectName}" does not meet proper dotnet naming conventions. ` + 
        `It's recommended that the project name be changed to "${recommendedName}".`
        ));
    }
    return Promise.resolve();
  };
  
  publishProject = (name: string, path: string, destinationPath: string): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Publishing project '${name}...'`)
      exec(`dotnet publish --no-build --no-restore --output ${destinationPath}`, { cwd: path}, function(ex, _stdout, stderr) {
        if (stderr) console.log(stderr);
        if (ex) return err(ex);
        res();
      });
    });
  }

}