import 'mocha';
import * as sinon from 'sinon';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { NodeEnvironmentBuildCommand } from './node-environment.command';

describe('Build Node Environment Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "build-node"', () => {
    let subject = new NodeEnvironmentBuildCommand();
    expect(subject.name).to.equal("build-node");
  });

  it('run should throw is solution file not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let subject = new NodeEnvironmentBuildCommand();
    subject.fileService = fileServiceMock;
    subject.run(null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Solution file does not exist in specified location.");
        done();
      });
  });

  it('run should throw if build command throws', (done) => {
    let fileServiceMock = createMock<IFileService>();
    sandbox.stub(_cmd, 'exec').yields(new Error("test error"), null, "output");
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample"
      }
    ]}));
    let subject = new NodeEnvironmentBuildCommand();
    subject.fileService = fileServiceMock;
    subject.run("./solution/shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: []}));
    let subject = new NodeEnvironmentBuildCommand();
    subject.fileService = fileServiceMock;
    subject.run("./solution/shaman.json").then(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    sandbox.stub(_cmd, 'exec').yields(null, null, null);
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample"
      }
    ]}));
    let subject = new NodeEnvironmentBuildCommand();
    subject.fileService = fileServiceMock;
    subject.run("./solution/shaman.json").then(_ => done());
  });

});