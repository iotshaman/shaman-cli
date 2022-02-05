import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ICommand } from '../command';
import { InstallCommand } from './install.command';
import { IFileService } from '../../services/file.service';

describe('Install Command', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "install"', () => {
    let subject = new InstallCommand();
    expect(subject.name).to.equal("install");
  });

  it('run should throw error if invalid environment provided', (done) => {
    let subject = new InstallCommand();
    subject.installCommands = [];
    subject.run("invalid", null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid environment 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise for single environment install', (done) => {
    let subject = new InstallCommand();
    subject.installCommands = [new MockNodeInstallCommand()];
    subject.run("node", null).then(_ => done());
  });

  it('run should call both node and dotnet install commands if no arguments provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
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
    ]}));
    let nodeInstallCommandMock = new MockNodeInstallCommand();
    sandbox.stub(nodeInstallCommandMock, 'run');
    let dotnetInstallCommandMock = new MockDotnetInstallCommand();
    sandbox.stub(dotnetInstallCommandMock, 'run');
    let subject = new InstallCommand();
    subject.fileService = fileServiceMock;
    subject.installCommands = [nodeInstallCommandMock, dotnetInstallCommandMock];
    subject.run().then(_ => {
      expect(nodeInstallCommandMock.run).to.have.been.called;
      expect(dotnetInstallCommandMock.run).to.have.been.called;
      done();
    });
  });

  it('run should return resolved promise for multiple environment build', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
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
    ]}));
    let subject = new InstallCommand();
    subject.fileService = fileServiceMock;
    subject.installCommands = [new MockNodeInstallCommand(), new MockDotnetInstallCommand()];
    subject.run("*", "./shaman.json").then(_ => done());
  });

});

class MockNodeInstallCommand implements ICommand {

  get name(): string { return "install-node"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}

class MockDotnetInstallCommand implements ICommand {

  get name(): string { return "install-dotnet"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}