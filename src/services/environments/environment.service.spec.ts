import 'mocha';
import * as _path from 'path';
import * as _cmd from 'child_process';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../file.service';
import { Solution } from '../../models/solution';
import { EnvironmentServiceBase } from './environment.service';

describe('Node Environment Service', () => {
  
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('addProjectScaffoldFile should add "name" property to output file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.name).to.equal("sample")
      return Promise.resolve();
    });
    let subject = new FakeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.addProjectScaffoldFile("./sample", "sample", null).then(_ => done());
  });

  it('addProjectScaffoldFile should add empty "include" property to output file if none specified in solution', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.include.length).to.equal(0);
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [{name: 'sample', environment: 'node', type: 'library', path: './sample'}];
    let subject = new FakeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.addProjectScaffoldFile("./sample", "sample", solution).then(_ => done());
  });

  it('addProjectScaffoldFile should add empty "specs" property to output file if none specified in solution', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.specs).not.to.be.undefined;
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [{name: 'sample', environment: 'node', type: 'library', path: './sample'}];
    let subject = new FakeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.addProjectScaffoldFile("./sample", "sample", solution).then(_ => done());
  });

  it('addProjectScaffoldFile should add "include" property to output file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.include[0]).to.equal("db");
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [
      {name: 'sample', environment: 'node', type: 'library', path: './sample', include: ['db']},
      {name: 'db', environment: 'node', type: 'database', path: './db'}
    ];
    let subject = new FakeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.addProjectScaffoldFile("./sample", "sample", solution).then(_ => done());
  });

  it('addProjectScaffoldFile should add "specs" property to output file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.specs.foo).to.equal('bar');
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [{name: 'sample', environment: 'node', type: 'library', path: './sample', specs: {foo: 'bar'}}];
    let subject = new FakeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.addProjectScaffoldFile("./sample", "sample", solution).then(_ => done());
  });

  it('executeProjectScaffolding should throw error if child process throws', (done) => {
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(1)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new FakeEnvironmentService();
    subject.executeProjectScaffolding("./sample")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("An error occurred while executing project scaffolding.");
        done();
      });
  });

  it('executeProjectScaffolding should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.deleteFile = sandbox.stub().returns(Promise.resolve());
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new FakeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.executeProjectScaffolding("./sample").then(_ => done());
  });

});

class FakeEnvironmentService extends EnvironmentServiceBase {

  fileService: IFileService;

  updateProjectDefinition = (folderPath: string, projectName: string, solution: Solution): Promise<void> => {
    return Promise.reject(new Error("Not implemented."));
  }  

  installDependencies = (folderPath: string, projectName: string): Promise<void> => {
    return Promise.reject(new Error("Not implemented."));
  }

  buildProject = (name: string, path: string): Promise<void> => {
    return Promise.reject(new Error("Not implemented."));
  }

  checkNamingConvention = (solutionName: string, projectName: string): Promise<void> => {
    return Promise.reject(new Error("Not implemented."));
  };

}