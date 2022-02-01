import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ICommand } from '../command';
import { ServeCommand } from './serve.command';
import { IFileService } from '../../services/file.service';
import { Solution } from '../../models/solution';

describe('Serve Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "serve"', () => {
    let subject = new ServeCommand();
    expect(subject.name).to.equal("serve");
  });

  it('run should throw error if no project provided', (done) => {
    let subject = new ServeCommand();
    subject.run(null, null)
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
    let subject = new ServeCommand();
    subject.fileService = fileServiceMock;
    subject.run("invalid", "shaman.json")
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
    let subject = new ServeCommand();
    subject.fileService = fileServiceMock;
    subject.run("sample", "shaman.json")
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
    let subject = new ServeCommand();
    subject.fileService = fileServiceMock;
    subject.runCommands = [
      {name: 'run-noop', instance: () => new NoopServeCommand(undefined)}
    ]
    subject.run("sample", "shaman.json").then(_ => done());
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
    let subject = new ServeCommand();
    subject.fileService = fileServiceMock;
    subject.runCommands = [
      {name: 'run-noop', instance: () => new NoopServeCommand(undefined)}
    ]
    subject.run("sample", "shaman.json").then(_ => done());
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
    let subject = new ServeCommand();
    subject.fileService = fileServiceMock;
    subject.runCommands = [
      {name: 'run-noop', instance: () => new NoopServeCommand(solution => {
        expect(solution).not.to.be.null;
      })}
    ]
    subject.run("sample", "shaman.json").then(_ => done());
  });

})

class NoopServeCommand implements ICommand {

  get name(): string { return "run-noop"; }

  constructor(assignSolution: (solution: Solution) => void) {
    this.assignSolution = assignSolution;
  }

  run = (): Promise<void> => {
    return Promise.resolve();
  }

  assignSolution = (solution: Solution) => {}

  waitForChildProcesses = undefined;

}