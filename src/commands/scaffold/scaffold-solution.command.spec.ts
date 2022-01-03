import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ICommand } from '../command';
import { ScaffoldSolutionCommand } from './scaffold-solution.command';
import { IFileService } from '../../services/file.service';

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

  it('run should throw if shaman file not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.run(null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Shaman file does not exist in specified location.");
        done();
      });
  });

  it('run should throw if scaffold environment not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "invalid"
      }
    ]}));
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("./shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid environment 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({projects: []}));
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("./shaman.json").then(_ => done());
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
    let subject = new ScaffoldSolutionCommand();
    subject.fileService = fileServiceMock;
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("./shaman.json").then(_ => done());
  });

})

class NoopScaffoldCommand implements ICommand {

  get name(): string { return "scaffold-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}