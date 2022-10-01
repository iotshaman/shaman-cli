import * as _path from 'path';
import { IChildCommand, ICommand } from '../command';
import { Solution } from '../../models/solution';
import { NodePublishCommand } from './node/node-publish.command';
import { DotnetPublishCommand } from './dotnet/dotnet-publish.command';
import { IFileService, FileService } from '../../services/file.service';
import { IPublishInstructionService } from './instructions/publish-instruction-service';
import { IPublishInstruction } from './publish-instruction';
import { CopyFilePublishInstructionService } from './instructions/copy-file.instruction';
import { CommandLineArguments } from '../../command-line-arguments';

export class PublishCommand implements ICommand {

  get name(): string { return "publish" };
  publishCommands: IChildCommand[] = [];
  publishInstructionsServices: IPublishInstructionService[] = [
    new CopyFilePublishInstructionService()
  ];
  fileService: IFileService = new FileService();
  childCommandFactory: (solutionFilePath: string) => IChildCommand[];

  private environment;
  private solutionFilePath;

  constructor() {
    this.childCommandFactory = (solutionFilePath: string): IChildCommand[] => {
      return [
        new NodePublishCommand(solutionFilePath),
        new DotnetPublishCommand(solutionFilePath)
      ]
    }
  }

  run = (cla: CommandLineArguments): Promise<void> => {
    this.assignArguments(cla);
    this.publishCommands = this.childCommandFactory(this.solutionFilePath);
    console.log("Publishing solution...");
    let cwd = this.solutionFilePath.replace("shaman.json", "");
    let publishEnvironmentsTask = () => this.fileService.getShamanFile(this.solutionFilePath).then(solution => {
      if (this.environment != "*") {
        return this.publishEnvironment(this.environment)
          .then(_ => ({solution, environments: [this.environment]}));
      }
      let projectEnvironments = solution.projects.map(p => p.environment);
      let environmetsSet = [...new Set(projectEnvironments)];
      return environmetsSet.reduce((a, b) => a.then(_ =>
        this.publishEnvironment(b)
      ), Promise.resolve())
      .then(_ => ({solution, environments: environmetsSet}));
    });
    return this.fileService.ensureFolderExists(cwd, "bin")
      .then(_ => publishEnvironmentsTask())
      .then(rslt => this.processInstructions(cwd, rslt.solution, rslt.environments))
      .then(_ => console.log("Solution publish is complete."));
  }

  private publishEnvironment(environment: string): Promise<void> {
    let cmd = this.publishCommands.find(c => c.name == `publish-${environment}`)
    if (!cmd) return Promise.reject(new Error(`Invalid environment '${environment}'.`));
    return cmd.run();
  }

  private processInstructions = (cwd: string, solution: Solution, environments: string[]): Promise<void> => {
    let instructions: {project: string, instruction: IPublishInstruction}[] = solution.projects 
      .filter(p => environments.some(e => e == p.environment))
      .filter(p => !!p.specs?.publish?.length)
      .map(p => ({name: p.name, instructions: <IPublishInstruction[]>p.specs.publish}))
      .reduce((a: {project: string, instruction: IPublishInstruction}[], b) => {
        b.instructions.forEach(instruction => a.push({project: b.name, instruction: instruction}))
        return a;
      }, []);

    return instructions.reduce((a, b) => a.then(_ => {
      let instructionService = this.publishInstructionsServices
        .find(i => i.instruction == b.instruction.instruction);
      if (!instructionService) throw new Error(`Invalid publish instruction: '${b.instruction.instruction}'.`);
      let project = solution.projects.find(p => p.name == b.project);
      return instructionService.processInstruction(cwd, solution, project);
    }), Promise.resolve());
  }

  private assignArguments = (cla: CommandLineArguments) => {
    this.environment = cla.getValueOrDefault('environment');
    this.solutionFilePath = cla.getValueOrDefault('filePath');
  }

}
