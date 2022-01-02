import 'mocha';
import * as sinon from 'sinon';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { NodeEnvironmentScaffoldCommand } from './node-environment.command';

describe('Scaffold Node Environment Command', () => {

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

  it('run should throw if project type not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let readJsonStub = sandbox.stub();
    readJsonStub.onCall(0).returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    readJsonStub.onCall(1).returns(Promise.resolve({name: ''}));
    fileServiceMock.readJson = readJsonStub;
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
    sandbox.stub(_cmd, 'exec').yields(new Error("test error"), null, null);
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.run("library", "test", "./test")
      .catch((ex: Error) => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('run should throw if project type not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let readJsonStub = sandbox.stub();
    readJsonStub.onCall(0).returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    readJsonStub.onCall(1).returns(Promise.resolve({name: ''}));
    fileServiceMock.readJson = readJsonStub;
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
    sandbox.stub(_cmd, 'exec').yields(null, null, "output");
    let subject = new NodeEnvironmentScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.run("library", "test", "./test").then(_ => done());
  });

});