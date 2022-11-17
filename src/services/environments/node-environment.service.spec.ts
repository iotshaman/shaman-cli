import 'mocha';
import * as _path from 'path';
import * as _cmd from 'child_process';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../file.service';
import { NodeEnvironmentService } from './node-environment.service';
import { Solution } from '../../models/solution';

describe('Node Environment Service', () => {

  chai.use(sinonChai);
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
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ name: "old" }));
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
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ name: "old", dependencies: {} }));
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
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ name: "old", dependencies: {} }));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
      expect(json.dependencies).to.be.empty;
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [{ name: 'sample', environment: 'node', template: 'library', path: './sample' }];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "new", solution).then(_ => done());
  });

  it('updateProjectDefinition should throw error if "include" config contains invalid project name', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ name: "old", dependencies: {} }));
    fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
    let solution = new Solution();
    solution.projects = [
      { name: 'sample', environment: 'node', template: 'library', path: './sample', include: ['invalid'] }
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
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ name: "old" }));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_outputPath, json) => {
      expect(json.dependencies["db"]).to.equal(`file:${_path.join("../", "db")}`);
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [
      { name: 'sample', environment: 'node', template: 'library', path: './sample', include: ['db'] },
      { name: 'db', environment: 'node', template: 'database', path: './db' }
    ];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "sample", solution).then(_ => done());
  });

  it('updateProjectDefinition should update package dependencies', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ name: "old", dependencies: {} }));
    fileServiceMock.writeJson = sandbox.stub().callsFake((_outputPath, json) => {
      expect(json.dependencies["db"]).to.equal(`file:${_path.join("../", "db")}`);
      return Promise.resolve();
    });
    let solution = new Solution();
    solution.projects = [
      { name: 'sample', environment: 'node', template: 'library', path: './sample', include: ['db'] },
      { name: 'db', environment: 'node', template: 'database', path: './db' }
    ];
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.updateProjectDefinition("./sample", "sample", solution).then(_ => done());
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

  it('checkNamingConvention should return resolved promise', (done) => {
    let subject = new NodeEnvironmentService();
    subject.checkNamingConvention("test").then(_ => done());
  });


  it('publishProject should call copyFolder', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.copyFolder = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeEnvironmentService();
    subject.fileService = fileServiceMock;
    subject.publishProject(null, null, null).then(_ => {
      expect(fileServiceMock.copyFolder).to.have.been.called;
      done();
    });
  });

});
