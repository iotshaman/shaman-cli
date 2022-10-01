import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ICommand } from '../command';
import { ScaffoldSolutionCommand } from './scaffold-solution.command';
import { IFileService } from '../../services/file.service';
import { Solution, SolutionProject } from '../../models/solution';
import { ITransformationService } from '../../services/transformation.service';

describe('Scaffold Solution Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "scaffold-solution"', () => {
    let subject = new ScaffoldSolutionCommand();
    expect(subject.name).to.equal("scaffold-solution");
  });

  it('run should throw if scaffold environment not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "invalid"
      }
    ]}));
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid environment 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: []}));
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("./shaman.json").then(_ => done());
  });

  it('run should not call applySolution', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "noop"
      }
    ]}));
    let transformationServiceMock = createMock<ITransformationService>();
    transformationServiceMock.performTransformations = sandbox.stub().returns(Promise.resolve());
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.transformationService = transformationServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.scaffoldCommands[0].assignSolution = undefined;
    subject.run("./shaman.json").then(_ => done());
  });

  it('run should not call scaffoldProject if the projects path alreay exists', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "noop"
      }
    ]}));
    let transformationServiceMock = createMock<ITransformationService>();
    transformationServiceMock.performTransformations = sandbox.stub().returns(Promise.resolve());
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.transformationService = transformationServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("./shaman.json").then(_ => done());
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
    let transformationServiceMock = createMock<ITransformationService>();
    transformationServiceMock.performTransformations = sandbox.stub().returns(Promise.resolve());
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.transformationService = transformationServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("./shaman.json").then(_ => done());
  });

})

class NoopScaffoldCommand implements ICommand {

  get name(): string { return "scaffold-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }

  assignSolution = (solution: Solution) => {}

  assignProject = (project: SolutionProject) => {}
}