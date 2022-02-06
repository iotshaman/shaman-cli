import * as _path from 'path';
import { exec } from "child_process";
import { EnvironmentServiceBase } from "./environment.service";
import { Solution } from '../../models/solution';
import { FileService, IFileService } from '../file.service';
import { DotnetProjectFile } from "../../models/dotnet/dotnet-project-file";

export class DotnetEnvironmentService extends EnvironmentServiceBase {

  fileService: IFileService = new FileService();

  updateProjectDefinition = (folderPath: string, projectName: string, solution: Solution): Promise<void> => {
    let updateProjectTask = Promise.resolve();
    let project = solution.projects.find(p => p.name == projectName);
    let language = project.language ?? "csharp";
    let defaultProjecFilePath = _path.join(folderPath, `shaman.${language}.csproj`);
    if (!!project.include?.length) {
      updateProjectTask = this.fileService.readXml<DotnetProjectFile>(defaultProjecFilePath).then(xml => {
        let projectFile = new DotnetProjectFile(xml);
        project.include.forEach(dep => {
          let dependentProject = solution.projects.find(p => p.name == dep);
          if (!dependentProject) throw new Error(`Invalid dependency '${dep}'.`);
          projectFile.addProjectReference(_path.join("../", dependentProject.path, `${dep}.csproj`));
        });
        return this.fileService.writeXml(defaultProjecFilePath, projectFile.toXml());
      });
    }
    return updateProjectTask.then(_ => {
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

}