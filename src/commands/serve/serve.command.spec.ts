import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IChildCommand, ICommand } from '../command';
import { ServeCommand } from './serve.command';
import { IFileService } from '../../services/file.service';
import { Solution, SolutionProject } from '../../models/solution';
import { CommandLineArguments } from '../../command-line-arguments';

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
    let cla = new CommandLineArguments(['test', 'test', 'serve']);
    subject.run(cla)
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
    let cla = new CommandLineArguments(['test', 'test', 'serve', '--project=invalid']);
    let subject = new ServeCommand();
    subject.fileService = fileServiceMock;
    subject.run(cla)
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
    let cla = new CommandLineArguments(['test', 'test', 'serve', '--project=sample']);
    let subject = new ServeCommand();
    subject.fileService = fileServiceMock;
    subject.run(cla)
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
    let cla = new CommandLineArguments(['test', 'test', 'serve', '--project=sample']);
    let subject = new ServeCommand();
    subject.childCommandFactory = sandbox.stub().returns(
      [new NoopServeCommand()]
    );
    subject.fileService = fileServiceMock;
    subject.run(cla).then(_ => done());
  });
  
})

class NoopServeCommand implements IChildCommand {

  get name(): string { return "run-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }

  assignProject = (project: SolutionProject) => { }

}
