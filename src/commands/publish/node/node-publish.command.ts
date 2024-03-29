import * as _path from 'path';
import { Solution, SolutionProject } from '../../../models/solution';
import { IChildCommand } from '../../command';
import { FileService } from '../../../services/file.service';
import { DependencyTree } from '../../../models/dependency-tree';
import { NodeEnvironmentService } from '../../../services/environments/node-environment.service';
import { IEnvironmentService } from '../../../services/environments/environment.service';

export class NodePublishCommand implements IChildCommand {

  get name(): string { return "publish-node" };
  fileService = new FileService();
  environmentService: IEnvironmentService = new NodeEnvironmentService();

  constructor(
    private solutionFilePath
  ) { }

  run = (): Promise<void> => {
    this.solutionFilePath = _path.join(process.cwd(), this.solutionFilePath);
    return this.fileService.getShamanFile(this.solutionFilePath).then(solution => {
      let projects = solution.projects.filter(p => p.environment == "node");
      if (!projects.length) return Promise.resolve();
      console.log("Publishing node projects...");
      return this.publishSolution(this.solutionFilePath, projects, solution.name ?? "publish-node")
        .then(_ => console.log("Node projects published successfully..."));
    })
  }

  private publishSolution = (solutionFilePath: string, projects: SolutionProject[], name: string): Promise<void> => {
    let cwd = solutionFilePath.replace('shaman.json', '');
    let binPath = _path.join(cwd, 'bin');
    let publishFolder = _path.join(binPath, 'node');
    let dependencyTree = new DependencyTree(projects);
    let publishOrder = dependencyTree.getOrderedProjectList();
    return this.fileService.ensureFolderExists(binPath, "node")
      .then(_ => this.createSolutionPackageJsonFile(publishFolder, name, projects))
      .then(_ => this.createShamanJsonPublishFile(publishFolder, projects, name))
      .then(_ => publishOrder.reduce((a, b) => a.then(_ => {
        let project = projects.find(p => p.name == b);
        let projectFolder = _path.join(cwd, project.path);
        let buildFolder = _path.join(projectFolder, 'dist');
        let outputPath = _path.join(binPath, "node", project.path, "bin");
        return this.fileService.ensureFolderExists(_path.join(binPath, "node"), project.path)
          .then(_ => this.environmentService.buildProject(b, projectFolder))
          .then(_ => this.environmentService.publishProject(b, buildFolder, outputPath))
          .then(_ => this.copyPackageJsonFile(projectFolder, _path.join(outputPath, '..')));
      }), Promise.resolve()));
  }

  private createSolutionPackageJsonFile = (publishFolder: string, name: string,
    projects: SolutionProject[]): Promise<void> => {
    let outputFilePath = _path.join(publishFolder, 'package.json');
    let publishPkg = {
      name: name,
      version: "1.0.0",
      description: "Published by Shaman CLI.",
      author: "Shaman CLI",
      license: "UNLICENSED",
      scripts: {
        restore: "shaman install node"
      },
      dependencies: {
        "shaman-cli": "^1.0.18"
      }
    }
    let executableProjects = projects.filter(p => !!p.specs?.executable);
    if (!!executableProjects.length) {
      let scripts = executableProjects.reduce((a, b) => {
        a[b.name] = `shaman serve ${b.name}`;
        return a;
      }, {});
      publishPkg.scripts = { ...publishPkg.scripts, ...scripts };
    }
    return this.fileService.writeJson(outputFilePath, publishPkg);
  }

  private createShamanJsonPublishFile = (publishFolder: string, projects: SolutionProject[], name: string): Promise<void> => {
    let outputFilePath = _path.join(publishFolder, 'shaman.json');
    let shamanJsonFile: Solution = {
      name: name,
      projects: projects.map(project => ({
        name: project.name,
        environment: project.environment,
        type: project.type,
        path: project.path,
        language: project.language,
        include: project.include
      }))
    }
    return this.fileService.writeJson(outputFilePath, shamanJsonFile);
  }

  private copyPackageJsonFile = (projectFolder: string, outputFolder: string): Promise<void> => {
    let originFilePath = _path.join(projectFolder, 'package.json');
    let outputFilePath = _path.join(outputFolder, 'package.json');
    return this.fileService.readJson<any>(originFilePath).then(pkg => {
      let publishPkg = {
        name: pkg.name,
        version: pkg.version,
        main: !!pkg.main ? pkg.main.replace('dist/', 'bin/') : undefined,
        scripts: !!pkg.scripts?.start ? { start: pkg.scripts.start.replace('dist/', 'bin/') } : undefined,
        description: pkg.description,
        author: pkg.author,
        license: pkg.licence,
        dependencies: pkg.dependencies
      }
      return this.fileService.writeJson(outputFilePath, publishPkg);
    });
  }

}