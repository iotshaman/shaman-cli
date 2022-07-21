import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { NodeScaffoldCommand } from './node-scaffold.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { Solution, SolutionProject } from '../../../models/solution';
import { ITemplateService } from '../../../services/template.service';

describe('Scaffold Node Environment Command', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "scaffold-node"', () => {
    let subject = new NodeScaffoldCommand();
    expect(subject.name).to.equal("scaffold-node");
  });

  it('run should throw if project type not provided', (done) => {
    let subject = new NodeScaffoldCommand();
    subject.assignProject({ name: "test", environment: "dotnet", type: "", path: "test" });
    subject.run("./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project type argument not provided to scaffold-node command.");
        done();
      });
  });

  it('run should throw if project path not provided', (done) => {
    let subject = new NodeScaffoldCommand();
    subject.assignProject({ name: "test", environment: "dotnet", type: "test", path: "" });
    subject.run("./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project path argument not provided to scaffold-node command.");
        done();
      });
  });

  it('run should throw if name not provided', (done) => {
    let subject = new NodeScaffoldCommand();
    subject.assignProject({ name: "", environment: "dotnet", type: "test", path: "test" });
    subject.run("./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Name argument not provided to scaffold-node command.");
        done();
      });
  });

  it('run should throw if solution folder path not provided', (done) => {
    let subject = new NodeScaffoldCommand();
    subject.assignProject(new MockNodeProject());
    subject.run(null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Solution folder argument not provided to scaffold-node command.");
        done();
      });
  });

  it('run should throw call environmentService.updateProjectDefinition', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updateProjectDefinition = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignSolution(new Solution());
    subject.assignProject(new MockNodeProject());
    subject.run("./test").then(_ => {      
      expect(environmentServiceMock.updateProjectDefinition).to.have.been.called;
      done();
    });
  });

  it('run should throw call environmentService.addProjectScaffoldFile', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updateProjectDefinition = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignSolution(new Solution());
    subject.assignProject(new MockNodeProject());
    subject.run("./test").then(_ => {      
      expect(environmentServiceMock.addProjectScaffoldFile).to.have.been.called;
      done();
    });
  });

  it('run should throw call environmentService.installDependencies', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updateProjectDefinition = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignSolution(new Solution());
    subject.assignProject(new MockNodeProject());
    subject.run("./test").then(_ => {      
      expect(environmentServiceMock.installDependencies).to.have.been.called;
      done();
    });
  });

  it('run should throw call environmentService.executeProjectScaffolding', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updateProjectDefinition = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignSolution(new Solution());
    subject.assignProject(new MockNodeProject());
    subject.run("./test").then(_ => {      
      expect(environmentServiceMock.executeProjectScaffolding).to.have.been.called;
      done();
    });
  });

});

class MockNodeProject implements SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;

  constructor() {
    this.name = 'test';
    this.environment = 'node';
    this.type = 'test';
    this.path = 'test'
  }
}