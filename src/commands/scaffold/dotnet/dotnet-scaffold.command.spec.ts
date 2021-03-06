import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { DotnetScaffoldCommand } from './dotnet-scaffold.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';
import { Solution } from '../../../models/solution';
import { ITemplateService } from '../../../services/template.service';

describe('Scaffold DotNet Environment Command', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "scaffold-dotnet"', () => {
    let subject = new DotnetScaffoldCommand();
    expect(subject.name).to.equal("scaffold-dotnet");
  });

  it('run should throw if solution not assigned', (done) => {
    let subject = new DotnetScaffoldCommand();
    subject.run(null, "./test", "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Dotnet projects can only be scaffold as part of a solution.");
        done();
      });
  });

  it('run should throw if project type not provided', (done) => {
    let subject = new DotnetScaffoldCommand();
    subject.assignSolution(new Solution());
    subject.run(null, "./test", "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project type argument not provided to scaffold-dotnet command.");
        done();
      });
  });

  it('run should throw if project path not provided', (done) => {
    let subject = new DotnetScaffoldCommand();
    subject.assignSolution(new Solution());
    subject.run("library", null, "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project path argument not provided to scaffold-dotnet command.");
        done();
      });
  });

  it('run should throw if name not provided', (done) => {
    let subject = new DotnetScaffoldCommand();
    subject.assignSolution(new Solution());
    subject.run("library", "./test", null, "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Name argument not provided to scaffold-dotnet command.");
        done();
      });
  });

  it('run should throw if solution folder path not provided', (done) => {
    let subject = new DotnetScaffoldCommand();
    subject.assignSolution(new Solution());
    subject.run("library", "./test", "test", null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Solution folder argument not provided to scaffold-dotnet command.");
        done();
      });
  });

  it('run should throw if no solution name provided', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let subject = new DotnetScaffoldCommand();
    subject.assignSolution(new Solution());
    subject.fileService = fileServiceMock;
    subject.run("library", "./test", "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Dotnet solutions require a name, please update your shaman.json file.");
        done();
      });
  });

  it('run should throw if child process throws when adding dotnet solution file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(1)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let solution = new Solution(); solution.name = "test";
    subject.assignSolution(solution);
    subject.fileService = fileServiceMock;
    subject.run("library", "./test", "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("An error occurred while adding dotnet solution file.");
        done();
      });
  });

  it('run should not add solution file if solution file already exists', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let solution = new Solution(); solution.name = "test";
    subject.assignSolution(solution);
    subject.fileService = fileServiceMock;
    subject.templateService = createMock<ITemplateService>();
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("library", "./test", "test", "./test").then(_ => {
      expect(_cmd.spawn).to.have.been.calledOnce; 
      done()
    });
  });

  it('run should throw if child process throws when adding dotnet project to dotnet solution file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub()
    };
    spawnMock.on.onCall(0).yields(0);
    spawnMock.on.onCall(1).yields(1);
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let solution = new Solution(); solution.name = "test";
    subject.assignSolution(solution);
    subject.fileService = fileServiceMock;
    subject.templateService = createMock<ITemplateService>();
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("library", "./test", "test", "./test")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("An error occurred while adding dotnet project to solution.");
        done();
      });
  });

  it('run should add dotnet project to dotnet solution file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new DotnetScaffoldCommand();
    let solution = new Solution(); solution.name = "test";
    subject.assignSolution(solution);
    subject.fileService = fileServiceMock;
    subject.templateService = createMock<ITemplateService>();
    subject.environmentService = createMock<IEnvironmentService>();
    subject.run("library", "./test", "test", "./test").then(_ => {
      expect(_cmd.spawn).to.have.been.calledTwice;
      done();
    });
  });

});