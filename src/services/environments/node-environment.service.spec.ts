import 'mocha';
import * as _cmd from 'child_process';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../file.service';
import { NodeEnvironmentService } from './node-environment.service';
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

  it('updateProjectDefinition should update package name', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old"}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.name).to.equal("new");
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "new", solution).then(_ => done());
  });

  it('updateProjectDefinition should NOT update package dependencies if solution is null', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.dependencies).to.be.empty;
      return Promise.resolve();
    });
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "new", null).then(_ => done());
  });

  it('updateProjectDefinition should NOT update package dependencies if none configure in solution', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.dependencies).to.be.empty;
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [{name: 'sample', environment: 'node', type: 'library', path: './sample'}];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "new", solution).then(_ => done());
  });

  it('updateProjectDefinition should throw error if "include" config contains invalid project name', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
    let solution = new Solution();
    solution.projects = [
      {name: 'sample', environment: 'node', type: 'library', path: './sample', include: ['invalid']}
    ];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "sample", solution)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid dependency 'invalid'");
        done();
      });
  });

  it('updateProjectDefinition should create dependency property if it is not already available', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old"}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.dependencies["db"]).to.equal("file:..\\db")
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [
      {name: 'sample', environment: 'node', type: 'library', path: './sample', include: ['db']},
      {name: 'db', environment: 'node', type: 'database', path: './db'}
    ];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "sample", solution).then(_ => done());
  });

  it('updateProjectDefinition should update package dependencies', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.dependencies["db"]).to.equal("file:..\\db")
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [
      {name: 'sample', environment: 'node', type: 'library', path: './sample', include: ['db']},
      {name: 'db', environment: 'node', type: 'database', path: './db'}
    ];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "sample", solution).then(_ => done());
  });

  it('addProjectScaffoldFile should add "name" property to output file', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({name: "old", dependencies: {}}));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.name).to.equal("sample")
      return Promise.resolve();
    });
    let subject = new NodeEnvironmentService();
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
    let subject = new NodeEnvironmentService();
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
    let subject = new NodeEnvironmentService();
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
    let subject = new NodeEnvironmentService();
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
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.addProjectScaffoldFile("./sample", "sample", solution).then(_ => done());
  });

  it('installDependencies should throw if child process throws', (done) => {
    sandbox.stub(_cmd, 'exec').yields(new Error("test error"), null, "output");
    let subject = new NodeEnvironmentService();
    subject.installDependencies("./sample", "sample")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('installDependencies should return resolved promise', (done) => {
    sandbox.stub(_cmd, 'exec').yields(null, null, null);
    let subject = new NodeEnvironmentService();
    subject.installDependencies("./sample", "sample").then(_ => done());
  });

  it('executeProjectScaffolding should throw error if child process throws', (done) => {
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(1)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new NodeEnvironmentService();
    subject.executeProjectScaffolding("./sample")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("An error occurred while executing project scaffolding.");
        done();
      });
  });

  it('executeProjectScaffolding should return resolved promise', (done) => {
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    let subject = new NodeEnvironmentService();
    subject.executeProjectScaffolding("./sample").then(_ => done());
  });

  it('buildProject should throw if child process throws', (done) => {
    sandbox.stub(_cmd, 'exec').yields(new Error("test error"), null, "output");
    let subject = new NodeEnvironmentService();
    subject.buildProject("./sample", "sample")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("test error");
        done();
      });
  });

  it('buildProject should return resolved promise', (done) => {
    sandbox.stub(_cmd, 'exec').yields(null, null, null);
    let subject = new NodeEnvironmentService();
    subject.buildProject("./sample", "sample").then(_ => done());
  });

})