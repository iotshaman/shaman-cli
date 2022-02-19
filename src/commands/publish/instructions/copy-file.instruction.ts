import * as _path from 'path';
import { Solution, SolutionProject } from "../../../models/solution";
import { FileService, IFileService } from "../../../services/file.service";
import { IPublishInstruction } from "../publish-instruction";
import { IPublishInstructionService } from "./publish-instruction-service";

export interface CopyFilePublishInstruction extends IPublishInstruction {
  instruction: string;
  arguments: string[];
}

export class CopyFilePublishInstructionService implements IPublishInstructionService {

  fileService: IFileService = new FileService();
  get instruction(): string { return "copy"; }

  processInstruction = (cwd: string, _solution: Solution, project: SolutionProject): Promise<void> => {
    const instruction: CopyFilePublishInstruction = project.specs.publish
      .find((i: IPublishInstruction) => i.instruction == "copy");

    const copyFileTasks = instruction.arguments.map(file => {
      let originPath = _path.join(cwd, project.path, file);
      let outputPath = _path.join(cwd, 'bin', project.environment, project.path, file);
      return this.fileService.ensureFolderExists(_path.dirname(outputPath), './')
        .then(_ => this.fileService.copyFile(originPath, outputPath))
    });
    return Promise.all(copyFileTasks).then(_ => (null));
  }

}