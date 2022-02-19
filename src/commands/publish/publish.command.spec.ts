import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { ICommand } from '../command';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../services/file.service';
import { PublishCommand } from './publish.command';
import { IPublishInstructionService } from './instructions/publish-instruction-service';
import { Solution, SolutionProject } from '../../models/solution';

describe('Publish Command', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "publish"', () => {
    let subject = new PublishCommand();
    expect(subject.name).to.equal("publish");
  });

  it('run should throw error if invalid environment provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({ projects: [] }));
    let subject = new PublishCommand();
    subject.publishCommands = [];
    subject.fileService = fileServiceMock;
    subject.run("invalid")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid environment 'invalid'.");
        done();
      })
  });

  it('run should return resolved promise for single environment publish', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({ projects: [{
      name: "sample-node",
      path: "sample-node",
      environment: "node"
    }] }));
    let subject = new PublishCommand();
    subject.publishCommands = [new MockNodePublishCommand()];
    subject.fileService = fileServiceMock;
    subject.run("node", "./shaman.json").then(_ => done());
  });

  it('run should return ensure bin folder is created', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({ projects: [{
      name: "sample-node",
      path: "sample-node",
      environment: "node"
    }] }));
    fileServiceMock.ensureFolderExists = sandbox.stub().returns(Promise.resolve());
    let subject = new PublishCommand();
    subject.publishCommands = [new MockNodePublishCommand()];
    subject.fileService = fileServiceMock;
    subject.run("node", "./shaman.json").then(_ => {
      expect(fileServiceMock.ensureFolderExists).to.have.been.called;
      done();
    });
  });

  it('run should call both node and dotnet publish command if no arguments provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve(
      {
        projects: [
          {
            name: "sample-node",
            path: "sample-node",
            environment: "node"
          },
          {
            name: "sample-dotnet",
            path: "sample-dotnet",
            environment: "dotnet"
          }
        ]
      }));
    let nodePublishCommandMock = new MockNodePublishCommand();
    sandbox.stub(nodePublishCommandMock, 'run');
    let dotnetPublishCommandMock = new MockDotnetPublishCommand();
    sandbox.stub(dotnetPublishCommandMock, 'run');
    let subject = new PublishCommand();
    subject.fileService = fileServiceMock;
    subject.publishCommands = [nodePublishCommandMock, dotnetPublishCommandMock];
    subject.run().then(_ => {
      expect(dotnetPublishCommandMock.run).to.have.been.called;
      expect(nodePublishCommandMock.run).to.have.been.called;
      done();
    });
  });

  it('run should return resolved promise for multiple environment build', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve(
      {
        projects: [
          {
            name: "sample-node",
            path: "sample-node",
            environment: "node"
          },
          {
            name: "sample-dotnet",
            path: "sample-dotnet",
            environment: "dotnet"
          }
        ]
      }));
    let subject = new PublishCommand();
    subject.fileService = fileServiceMock;
    subject.publishCommands = [new MockNodePublishCommand, new MockDotnetPublishCommand];
    subject.run("*", "./shaman.json").then(_ => done());
  });

  it('run should throw if invalid instruction provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({ projects: [{
      name: "sample-node",
      path: "sample-node",
      environment: "node",
      specs: {publish: [{instruction: 'invalid', arguments: []}]}
    }] }));
    let subject = new PublishCommand();
    subject.publishCommands = [new MockNodePublishCommand()];
    subject.fileService = fileServiceMock;
    subject.run("node", "./shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid publish instruction: 'invalid'.");
        done();
      })
  });

  it('run should call processInstruction', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({ projects: [{
      name: "sample-node",
      path: "sample-node",
      environment: "node",
      specs: {publish: [{instruction: 'mock', arguments: []}]}
    }] }));
    let subject = new PublishCommand();
    subject.publishCommands = [new MockNodePublishCommand()];
    subject.publishInstructionsServices = [new MockPublishInstructionService()];
    sandbox.stub(subject.publishInstructionsServices[0], 'processInstruction');
    subject.fileService = fileServiceMock;
    subject.run("node", "./shaman.json").then(_ => {
      expect(subject.publishInstructionsServices[0].processInstruction).to.have.been.called;
      done();
    });
  });

});

class MockNodePublishCommand implements ICommand {
  get name(): string { return "publish-node"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}

class MockDotnetPublishCommand implements ICommand {
  get name(): string { return "publish-dotnet"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}

class MockPublishInstructionService implements IPublishInstructionService {
  get instruction(): string { return "mock"; }

  processInstruction = (cwd: string, solution: Solution, project: SolutionProject) => {
    return Promise.resolve();
  }
}