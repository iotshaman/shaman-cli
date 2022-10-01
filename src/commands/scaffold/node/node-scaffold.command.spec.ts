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
import { ProjectTransformation, Solution, SolutionProject, TemplateAuthorization } from '../../../models/solution';
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

  it('run should throw if solution not assigned', (done) => {
    let subject = new NodeScaffoldCommand();
    subject.run("./test", "")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Projects can only be scaffold as part of a solution.");
        done();
      });
  });

  it('run should throw if invalid project name provided', (done) => {
    let subject = new NodeScaffoldCommand();
    let mockSolution = new MockSolution();
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project name 'Test'.");
        done();
      });
  });

  it('run should throw if invalid project type provided', (done) => {
    let subject = new NodeScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    mockSolution.projects[0].type = '';
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project type configuration (project=Test).");
        done();
      });
  });

  it('run should throw if invalid project path provided', (done) => {
    let subject = new NodeScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    mockSolution.projects[0].path = '';
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project path configuration (project=Test).");
        done();
      });
  });

  it('run should call templateService.getCustomTemplate if custom project is provided.', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updateProjectDefinition = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getCustomTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipCustomProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeCustomProject()];
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test").then(_ => {      
      expect(templateServiceMock.getCustomTemplate).to.have.been.called;
      done();
    });
  });

  it('run should call templateService.unzipCustomProjectTemplate if custom project is provided.', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updateProjectDefinition = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getCustomTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipCustomProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeCustomProject()];
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test").then(_ => {      
      expect(templateServiceMock.unzipCustomProjectTemplate).to.have.been.called;
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
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test").then(_ => {      
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
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test").then(_ => {      
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
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test").then(_ => {      
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
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test").then(_ => {      
      expect(environmentServiceMock.executeProjectScaffolding).to.have.been.called;
      done();
    });
  });

});

class MockSolution implements Solution {
  name: string = 'sample-solution'
  projects: SolutionProject[] = []
  transform?: ProjectTransformation[] | undefined;
  auth?: TemplateAuthorization | undefined;
}

class MockNodeProject implements SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;

  constructor() {
    this.name = 'Test';
    this.environment = 'node';
    this.type = 'test';
    this.path = 'test'
  }
}

class MockNodeCustomProject implements SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;
  custom: boolean;

  constructor() {
    this.name = 'Test';
    this.environment = 'node';
    this.type = 'test';
    this.path = 'test'
    this.custom = true;
  }
}