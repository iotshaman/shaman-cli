import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { IChildCommand, ICommand } from '../command';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../services/file.service';
import { BuildCommand } from './build.command';
import { CommandLineArguments } from '../../command-line-arguments';

describe('Build Command', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "build"', () => {
    let subject = new BuildCommand();
    expect(subject.name).to.equal("build");
  });

  it('run should throw error if invalid environment provided', (done) => {
    let subject = new BuildCommand();
    let cla = new CommandLineArguments(['test', 'test', 'build', '--environment=invalid']);
    subject.run(cla)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid environment 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise for single environment build', (done) => {
    let subject = new BuildCommand();
    subject.childCommandFactory = sandbox.stub().returns(
      [new MockDotnetBuildCommand(), new MockNodeBuildCommand()]
    );
    let cla = new CommandLineArguments(['test', 'test', 'build', '--environment=node']);
    subject.run(cla).then(_ => done());
  });

  it('run should call both node and dotnet build commands if no arguments provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
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
    let cla = new CommandLineArguments(['test', 'test', 'build']);
    let nodeBuildCommandMock = new MockNodeBuildCommand();
    sandbox.stub(nodeBuildCommandMock, 'run');
    let dotnetBuildCommandMock = new MockDotnetBuildCommand();
    sandbox.stub(dotnetBuildCommandMock, 'run');
    let subject = new BuildCommand();
    subject.childCommandFactory = sandbox.stub().returns(
      [dotnetBuildCommandMock, nodeBuildCommandMock]
    );
    subject.fileService = fileServiceMock;
    subject.run(cla).then(_ => {
      expect(nodeBuildCommandMock.run).to.have.been.called;
      expect(dotnetBuildCommandMock.run).to.have.been.called;
      done();
    });
  });

  it('run should return resolved promise for multiple environment build', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
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
    let cla = new CommandLineArguments(['test', 'test', 'build']);
    let subject = new BuildCommand();
    subject.childCommandFactory = sandbox.stub().returns(
      [new MockDotnetBuildCommand(), new MockNodeBuildCommand()]
    );
    subject.fileService = fileServiceMock;
    subject.run(cla).then(_ => done());
  });

});

class MockNodeBuildCommand implements IChildCommand {

  get name(): string { return "build-node"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}

class MockDotnetBuildCommand implements IChildCommand {

  get name(): string { return "build-dotnet"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}