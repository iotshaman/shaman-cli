import 'mocha';
import * as sinon from 'sinon';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { NodeEnvironmentRunCommand } from './node-environment.run-command';

describe('Run Node Environment Command', () => {

  var sandbox: sinon.SinonSandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "run-node"', () => {
    let subject = new NodeEnvironmentRunCommand();
    expect(subject.name).to.equal("run-node");
  });

  it('run should throw if solution file not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let subject = new NodeEnvironmentRunCommand();
    subject.fileService = fileServiceMock;
    subject.run("sample", null, "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Solution file does not exist in specified location.");
        done();
      });
  });

  it('run should throw if invalid project provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample"
      }
    ]}));
    let subject = new NodeEnvironmentRunCommand();
    subject.fileService = fileServiceMock;
    subject.run("invalid", "start", "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample"
      }
    ]}));
    let subject = new NodeEnvironmentRunCommand();
    subject.fileService = fileServiceMock;
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    subject.run("sample", "start", "shaman.json").then(_ => done()).catch(console.dir);
  });

})