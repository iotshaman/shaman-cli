import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ICommand } from '../command';
import { RunCommand } from './run.command';
import { IFileService } from '../../services/file.service';
import { Solution } from '../../models/solution';

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

  it('run should throw if invalid project provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample"
      }
    ]}));
    let subject = new RunCommand();
    subject.fileService = fileServiceMock;
    subject.run("invalid", "start", null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project 'invalid'.");
        done();
      });
  });

  it('run should throw if invalid environment provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
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
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "noop"
      }
    ]}));
    let subject = new RunCommand();
    subject.fileService = fileServiceMock;
    subject.runCommands = [new NoopRunCommand()];
    subject.runCommands[0].assignSolution = undefined;
    subject.run("sample", "start", "shaman.json").then(_ => done());
  });

  it('run should call assignSolution', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "noop"
      }
    ]}));
    let subject = new RunCommand();
    subject.fileService = fileServiceMock;
    subject.runCommands = [new NoopRunCommand()];
    sandbox.stub(subject.runCommands[0], 'assignSolution').callsFake(solution => {
      expect(solution).not.to.be.null;
    })
    subject.run("sample", "start", "shaman.json").then(_ => done());
  });

})

class NoopRunCommand implements ICommand {

  get name(): string { return "run-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }

  assignSolution = (solution: Solution) => {}

}