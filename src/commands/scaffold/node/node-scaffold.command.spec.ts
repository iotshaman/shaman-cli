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
    let mockSolution = new MockSolution();
    let subject = new NodeScaffoldCommand(mockSolution, './');
    expect(subject.name).to.equal("scaffold-node");
  });

  it('run should throw if project not assigned', (done) => {
    let mockSolution = new MockSolution();
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.run()
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project file has not been assigned to scaffold command.");
        done();
      });
  });
  
  it('run should throw if invalid project template provided', (done) => {
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    mockSolution.projects[0].template = '';
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.assignProject(mockSolution.projects[0]);
    subject.run()
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project template configuration (project=Test).");
        done();
      });
  });

  it('run should throw if invalid project path provided', (done) => {
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    mockSolution.projects[0].path = '';
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.assignProject(mockSolution.projects[0]);
    subject.run()
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
      environment: 'node', template: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipCustomProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeCustomProject()];
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignProject(mockSolution.projects[0]);
    subject.run().then(_ => {      
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
      environment: 'node', template: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipCustomProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeCustomProject()];
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignProject(mockSolution.projects[0]);
    subject.run().then(_ => {      
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
      environment: 'node', template: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignProject(mockSolution.projects[0]);
    subject.run().then(_ => {      
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
      environment: 'node', template: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignProject(mockSolution.projects[0]);
    subject.run().then(_ => {      
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
      environment: 'node', template: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignProject(mockSolution.projects[0]);
    subject.run().then(_ => {      
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
      environment: 'node', template: 'library', file: 'path.zip'
    }]}));
    templateServiceMock.unzipProjectTemplate = sandbox.stub().returns(Promise.resolve());
    let mockSolution = new MockSolution();
    mockSolution.projects = [new MockNodeProject()];
    let subject = new NodeScaffoldCommand(mockSolution, './');
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.templateService = templateServiceMock;
    subject.assignProject(mockSolution.projects[0]);
    subject.run().then(_ => {      
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
  template: string;
  path: string;

  constructor() {
    this.name = 'Test';
    this.environment = 'node';
    this.template = 'test';
    this.path = 'test'
  }
}

class MockNodeCustomProject implements SolutionProject {
  name: string;
  environment: string;
  template: string;
  path: string;
  custom: boolean;

  constructor() {
    this.name = 'Test';
    this.environment = 'node';
    this.template = 'test';
    this.path = 'test'
    this.custom = true;
  }
}
