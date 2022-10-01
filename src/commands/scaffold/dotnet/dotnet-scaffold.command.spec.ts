import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { DotnetScaffoldCommand } from './dotnet-scaffold.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { ProjectTransformation, Solution, SolutionProject, TemplateAuthorization } from '../../../models/solution';
import { ITemplateService } from '../../../services/template.service';

describe('Scaffold DotNet Environment Command', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "scaffold-dotnet"', () => {
    let subject = new DotnetScaffoldCommand();
    expect(subject.name).to.equal("scaffold-dotnet");
  });

  it('run should throw if solution not assigned', (done) => {
    let subject = new DotnetScaffoldCommand();
    subject.run("./test", "")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Projects can only be scaffold as part of a solution.");
        done();
      });
  });

  it('run should throw if invalid project name provided', (done) => {
    let subject = new DotnetScaffoldCommand();
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
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockDotnetProject()];
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
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockDotnetProject()];
    mockSolution.projects[0].path = '';
    subject.assignSolution(mockSolution);
    subject.run("./test", "Test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project path configuration (project=Test).");
        done();
      });
  });

  it('run should throw if child process throws when adding dotnet solution file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.checkNamingConvention = sandbox.stub().returns(Promise.resolve());
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(1)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockDotnetProject()];
    subject.environmentService = environmentServiceMock;
    subject.assignSolution(mockSolution);
    subject.fileService = fileServiceMock;
    subject.run("./test", "Test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("An error occurred while adding dotnet solution file.");
        done();
      });
  });

  it('run should not add solution file if solution file already exists', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockDotnetProject()];
    subject.assignSolution(mockSolution);
    subject.fileService = fileServiceMock;
    subject.templateService = createMock<ITemplateService>();
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("./test", "Test").then(_ => {
      expect(_cmd.spawn).to.have.been.calledOnce;
      done()
    });
  });

  it('run should throw if child process throws when adding dotnet project to dotnet solution file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub()
    };
    spawnMock.on.onCall(0).yields(0);
    spawnMock.on.onCall(1).yields(1);
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockDotnetProject()];
    subject.assignSolution(mockSolution);
    subject.fileService = fileServiceMock;
    subject.templateService = createMock<ITemplateService>();
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("./test", "Test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("An error occurred while adding dotnet project to solution.");
        done();
      });
  });

  it('run should add dotnet project to dotnet solution file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockDotnetProject()];
    subject.assignSolution(mockSolution);
    subject.fileService = fileServiceMock;
    subject.templateService = createMock<ITemplateService>();
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("./test", "Test").then(_ => {
      expect(_cmd.spawn).to.have.been.calledTwice;
      done();
    });
  });

  it('run should call templateService.getCustomTemplate if custom project is provided.', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getCustomTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'dotnet', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipCustomProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockCustomDotnetProject()];
    subject.assignSolution(mockSolution);
    subject.fileService = fileServiceMock;
    subject.templateService = templateServiceMock;
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("./test", "Test").then(_ => {
      expect(templateServiceMock.getCustomTemplate).to.have.been.called;
      done();
    });
  });

  it('run should call templateService.getCustomTemplate if custom project is provided.', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let templateServiceMock = createMock<ITemplateService>();
    templateServiceMock.getCustomTemplate = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'dotnet', type: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipCustomProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetScaffoldCommand();
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockCustomDotnetProject()];
    subject.assignSolution(mockSolution);
    subject.fileService = fileServiceMock;
    subject.templateService = templateServiceMock;
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("./test", "Test").then(_ => {
      expect(templateServiceMock.unzipCustomProjectTemplate).to.have.been.called;
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

class MockDotnetProject implements SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;

  constructor() {
    this.name = 'Test';
    this.environment = 'dotnet';
    this.type = 'test';
    this.path = 'test'
  }
}

class MockCustomDotnetProject implements SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;
  custom: boolean;

  constructor() {
    this.name = 'Test';
    this.environment = 'dotnet';
    this.type = 'test';
    this.path = 'test'
    this.custom = true;
  }
}