import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IChildCommand, ICommand } from '../command';
import { ScaffoldCommand } from './scaffold.command';
import { IFileService } from '../../services/file.service';
import { Solution, SolutionProject } from '../../models/solution';
import { ITransformationService } from '../../services/transformation.service';
import { CommandLineArguments } from '../../command-line-arguments';

describe('Scaffold Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "scaffold"', () => {
    let subject = new ScaffoldCommand();
    expect(subject.name).to.equal("scaffold");
  });

  it('run should throw if scaffold environment not found', (done) => {
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
    let cla = new CommandLineArguments(['test', 'test', 'scaffold']);
    let subject = new ScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.run(cla)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid environment 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({ projects: [] }));
    let cla = new CommandLineArguments(['test', 'test', 'scaffold']);
    let subject = new ScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.run(cla).then(_ => done());
  });

  it('run should not call scaffoldProject if the projects path alreay exists', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "noop"
        }
      ]
    }));
    let cla = new CommandLineArguments(['test', 'test', 'scaffold']);
    let transformationServiceMock = createMock<ITransformationService>();
    transformationServiceMock.performTransformations = sandbox.stub().returns(Promise.resolve());
    let subject = new ScaffoldCommand();
    subject.fileService = fileServiceMock;
    subject.transformationService = transformationServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run(cla).then(_ => done());
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
    let cla = new CommandLineArguments(['test', 'test', 'scaffold']);
    let transformationServiceMock = createMock<ITransformationService>();
    transformationServiceMock.performTransformations = sandbox.stub().returns(Promise.resolve());
    let subject = new ScaffoldCommand();
    subject.childCommandFactory = sandbox.stub().returns(
      [new NoopScaffoldCommand()]
    );
    subject.fileService = fileServiceMock;
    subject.transformationService = transformationServiceMock;
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
    let cla = new CommandLineArguments(['test', 'test', 'scaffold']);
    let transformationServiceMock = createMock<ITransformationService>();
    transformationServiceMock.performTransformations = sandbox.stub().returns(Promise.resolve());
    let subject = new ScaffoldCommand();
    let noopScaffoldCommand = new NoopScaffoldCommand();
    sandbox.stub(noopScaffoldCommand, 'assignProject').value(undefined);
    subject.childCommandFactory = sandbox.stub().returns(
      [noopScaffoldCommand]
    );
    subject.fileService = fileServiceMock;
    subject.transformationService = transformationServiceMock;
    // NOTE: ask kyle how to check that assignProject is not called
    subject.run(cla).then(_ => done());
  });

})

class NoopScaffoldCommand implements IChildCommand {

  get name(): string { return "scaffold-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }

  assignProject = (project: SolutionProject) => { }
}
