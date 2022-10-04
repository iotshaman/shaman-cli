import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IChildCommand, ICommand } from '../command';
import { RunCommand } from './run.command';
import { IFileService } from '../../services/file.service';
import { Solution, SolutionProject } from '../../models/solution';
import { CommandLineArguments } from '../../command-line-arguments';

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

  it('run should throw if no project assigned', (done) => {
    let subject = new RunCommand();
    let cla = new CommandLineArguments(['test', 'test', 'run']);
    subject.run(cla)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should throw if invalid project provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample"
        }
      ]
    }));
    let cla = new CommandLineArguments(['test', 'test', 'run', '--project=invalid']);
    let subject = new RunCommand();
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
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "invalid"
        }
      ]
    }));
    let cla = new CommandLineArguments(['test', 'test', 'run', '--project=sample'])
    let subject = new RunCommand();
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
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "noop"
        }
      ]
    }));
    let cla = new CommandLineArguments(['test', 'test', 'run', '--project=sample']);
    let subject = new RunCommand();
    subject.childCommandFactory = sandbox.stub().returns(
      [new NoopRunCommand()]
    );
    subject.fileService = fileServiceMock;
    subject.run(cla).then(_ => done());
  });

  it('run should call assignProject', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "noop"
        }
      ]
    }));
    let cla = new CommandLineArguments(['test', 'test', 'run', '--project=sample']);
    let subject = new RunCommand();
    let noopRunCommandMock = new NoopRunCommand();
    subject.childCommandFactory = sandbox.stub().returns(
      [noopRunCommandMock]
    );
    subject.fileService = fileServiceMock;
    sandbox.stub(noopRunCommandMock, 'assignProject').callsFake(project => {
      expect(project).not.to.be.null;
    })
    subject.run(cla).then(_ => done());
  });

  it('run should not call assignProject', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "noop"
        }
      ]
    }));
    let cla = new CommandLineArguments(['test', 'test', 'run', '--project=sample']);
    let subject = new RunCommand();
    let noopRunCommandMock = new NoopRunCommand();
    sandbox.stub(noopRunCommandMock, 'assignProject').value(undefined);
    subject.childCommandFactory = sandbox.stub().returns(
      [noopRunCommandMock]
    );
    subject.fileService = fileServiceMock;
    subject.run(cla).then(_ => done());
  });

})

class NoopRunCommand implements IChildCommand {

  get name(): string { return "run-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }

  assignProject = (project: SolutionProject) => { };

}
