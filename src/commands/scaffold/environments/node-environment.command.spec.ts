import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { NodeEnvironmentScaffoldCommand } from './node-environment.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { Solution } from '../../../models/solution';

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
    let subject = new NodeEnvironmentScaffoldCommand();
    expect(subject.name).to.equal("scaffold-node");
  });

  it('run should throw if project type not provided', (done) => {
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.run(null, "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project type argument not provided to scaffold-node command.");
        done();
      });
  });

  it('run should throw if name not provided', (done) => {
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.run("library", null, "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Name argument not provided to scaffold-node command.");
        done();
      });
  });

  it('run should throw if output path not provided', (done) => {
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.run("library", "test", null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Output argument not provided to scaffold-node command.");
        done();
      });
  });

  it('run should throw if path exists', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.run("library", "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Output directory already exists.");
        done();
      });
  });

  it('run should throw if project type not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({templates: []}));
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.run("library", "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project type not found: node-library");
        done();
      });
  });

  it('run should throw call environmentService.updatePackageDetails', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let readJsonStub = sandbox.stub();
    readJsonStub.onCall(0).returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    readJsonStub.onCall(1).returns(Promise.resolve({name: ''}));
    fileServiceMock.readJson = readJsonStub;
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updatePackageDetails = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.assignSolution(new Solution());
    subject.run("library", "test", "./test").then(_ => {      
      expect(environmentServiceMock.updatePackageDetails).to.have.been.called;
      done();
    });
  });

  it('run should throw call environmentService.addProjectScaffoldFile', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let readJsonStub = sandbox.stub();
    readJsonStub.onCall(0).returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    readJsonStub.onCall(1).returns(Promise.resolve({name: ''}));
    fileServiceMock.readJson = readJsonStub;
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updatePackageDetails = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.assignSolution(new Solution());
    subject.run("library", "test", "./test").then(_ => {      
      expect(environmentServiceMock.addProjectScaffoldFile).to.have.been.called;
      done();
    });
  });

  it('run should throw call environmentService.installDependencies', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let readJsonStub = sandbox.stub();
    readJsonStub.onCall(0).returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    readJsonStub.onCall(1).returns(Promise.resolve({name: ''}));
    fileServiceMock.readJson = readJsonStub;
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updatePackageDetails = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.assignSolution(new Solution());
    subject.run("library", "test", "./test").then(_ => {      
      expect(environmentServiceMock.installDependencies).to.have.been.called;
      done();
    });
  });

  it('run should throw call environmentService.executeProjectScaffolding', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let readJsonStub = sandbox.stub();
    readJsonStub.onCall(0).returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    readJsonStub.onCall(1).returns(Promise.resolve({name: ''}));
    fileServiceMock.readJson = readJsonStub;
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.updatePackageDetails = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.addProjectScaffoldFile = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    environmentServiceMock.executeProjectScaffolding = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.assignSolution(new Solution());
    subject.run("library", "test", "./test").then(_ => {      
      expect(environmentServiceMock.executeProjectScaffolding).to.have.been.called;
      done();
    });
  });

});