import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ICommand } from '../command';
import { RunCommand } from './run.command';
import { IFileService } from '../../services/file.service';

describe('Run Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "run"', () => {
    let subject = new RunCommand();
    expect(subject.name).to.equal("run");
  });

  it('run should throw error if no project provided', (done) => {
    let subject = new RunCommand();
    subject.runCommands = [];
    subject.run(null, null, null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should throw if solution file not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let subject = new RunCommand();
    subject.fileService = fileServiceMock;
    subject.run("sample", null, null)
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
    let subject = new RunCommand();
    subject.fileService = fileServiceMock;
    subject.run("invalid", "start", "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project 'invalid'.");
        done();
      });
  });

  it('run should throw if invalid project provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "invalid"
      }
    ]}));
    let subject = new RunCommand();
    subject.fileService = fileServiceMock;
    subject.run("sample", "start", "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid environment 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "noop"
      }
    ]}));
    let subject = new RunCommand();
    subject.fileService = fileServiceMock;
    subject.runCommands = [new NoopRunCommand()];
    subject.run("sample", "start", "shaman.json").then(_ => done());
  });

})

class NoopRunCommand implements ICommand {

  get name(): string { return "run-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}