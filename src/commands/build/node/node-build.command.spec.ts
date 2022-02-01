import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { NodeBuildCommand } from './node-build.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';

describe('Node Build Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "build-node"', () => {
    let subject = new NodeBuildCommand();
    expect(subject.name).to.equal("build-node");
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: []}));
    let subject = new NodeBuildCommand();
    subject.fileService = fileServiceMock;
    subject.run(null).then(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample"
      }
    ]}));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.buildProject = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeBuildCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run("./solution/shaman.json").then(_ => done());
  });

});