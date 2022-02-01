import { Solution } from "../../models/solution";

export interface IEnvironmentService {
  updatePackageDetails: (folderPath: string, projectName: string, solution?: Solution) => Promise<void>;
  addProjectScaffoldFile: (folderPath: string, projectName: string, solution?: Solution) => Promise<void>;
  installDependencies: (folderPath: string, projectName: string) => Promise<void>;
  executeProjectScaffolding: (folderPath: string) => Promise<void>;
  buildProject: (name: string, path: string) => Promise<void>;
}