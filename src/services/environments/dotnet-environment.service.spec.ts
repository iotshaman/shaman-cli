import 'mocha';
import * as _path from 'path';
import * as _cmd from 'child_process';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../file.service';
import { DotnetEnvironmentService } from './dotnet-environment.service';
import { Solution } from '../../models/solution';

describe('Node Environment Service', () => {
  
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('updateProjectDefinition should call renameFile', (done) => {
    let solution = new Solution();
    solution.projects = [{name: 'sample', environment: 'dotnet', type: 'library', path: './sample'}];
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.renameFile = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "sample", solution).then(_ => {
      expect(fileServiceMock.renameFile).to.have.been.called;
      done();
    });
  });

  it('updateProjectDefinition should throw if invalid dependency provided', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'a', environment: 'dotnet', type: 'library', path: './a', language: 'csharp', include: ['c']},
      {name: 'b', environment: 'dotnet', type: 'library', path: './b', language: 'csharp'}
    ];
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readXml = sandbox.stub().returns(Promise.resolve([{Project: []}]));
    fileServiceMock.writeXml = sandbox.stub().returns(Promise.resolve());
    fileServiceMock.renameFile = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./a", "a", solution)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid dependency 'c'.");
        done();
      });
  });

  it('updateProjectDefinition should update xml to add dependencies', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'a', environment: 'dotnet', type: 'library', path: './a', language: 'csharp', include: ['b']},
      {name: 'b', environment: 'dotnet', type: 'library', path: './b', language: 'csharp'}
    ];
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readXml = sandbox.stub().returns(Promise.resolve([{Project: []}]));
    fileServiceMock.writeXml = sandbox.stub().returns(Promise.resolve());
    fileServiceMock.renameFile = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./a", "a", solution).then(_ => {
      expect(fileServiceMock.renameFile).to.have.been.called;
      done();
    });
  });

  it('installDependencies should throw if child process throws', (done) => {
    sandbox.stub(_cmd, 'exec').yields(new Error("test error"), null, "output");
    let subject = new DotnetEnvironmentService();
    subject.installDependencies("./sample")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('installDependencies should return resolved promise', (done) => {
    sandbox.stub(_cmd, 'exec').yields(null, null, null);
    let subject = new DotnetEnvironmentService();
    subject.installDependencies("./sample").then(_ => done());
  });

  it('buildProject should throw if child process throws', (done) => {
    sandbox.stub(_cmd, 'exec').yields(new Error("test error"), null, "output");
    let subject = new DotnetEnvironmentService();
    subject.buildProject(null, "sample")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('buildProject should return resolved promise', (done) => {
    sandbox.stub(_cmd, 'exec').yields(null, null, null);
    let subject = new DotnetEnvironmentService();
    subject.buildProject(null, "sample").then(_ => done());
  });

});