import { EnvironmentServiceBase } from "./environment.service";
import { Solution } from '../../models/solution';
import { FileService, IFileService } from '../file.service';

export class DotnetEnvironmentService extends EnvironmentServiceBase {

  fileService: IFileService = new FileService();

  updateProjectDefinition = (folderPath: string, projectName: string, solution: Solution): Promise<void> => {
    return Promise.reject(new Error("Not implemented."));
  }  

  installDependencies = (folderPath: string, projectName: string): Promise<void> => {
    return Promise.reject(new Error("Not implemented."));
  }

  buildProject = (name: string, path: string): Promise<void> => {
    return Promise.reject(new Error("Not implemented."));
  }

}