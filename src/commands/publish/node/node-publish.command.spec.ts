import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { NodePublishCommand } from './node-publish.command';
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

  it('name should equal "publish-dotnet"', () => {
    let subject = new NodePublishCommand();
    expect(subject.name).to.equal("publish-node");
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: []}));
    let subject = new NodePublishCommand();
    subject.fileService = fileServiceMock;
    subject.run("shaman.json").then(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "node"
      }
    ]}));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.publishProject = sandbox.stub().returns(Promise.resolve());
    let subject = new NodePublishCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run("shaman.json").then(_ => done());
  });

  it('run should not make bin/node directory if bin/node directory exists', (done) => {
      let fileServiceMock = createMock<IFileService>();
      fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
        {
          name: "sample",
          path: "sample",
          environment: "node"
        }
      ]}));
      fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
      let environmentServiceMock = createMock<IEnvironmentService>();
      environmentServiceMock.publishProject = sandbox.stub().returns(Promise.resolve());
      let subject = new NodePublishCommand();
      subject.fileService = fileServiceMock;
      subject.environmentService = environmentServiceMock;
      subject.run("shaman.json").then(_ => done());
    });


});