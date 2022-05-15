import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { DotnetPublishCommand } from './dotnet-publish.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';

describe('Dotnet Build Command', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "publish-dotnet"', () => {
    let subject = new DotnetPublishCommand();
    expect(subject.name).to.equal("publish-dotnet");
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({ projects: [] }));
    let subject = new DotnetPublishCommand();
    subject.fileService = fileServiceMock;
    subject.run("shaman.json").then(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "dotnet",
          language: "csharp"
        }
      ]
    }));
    let environmentServiceMock = createMock<IEnvironmentService>();
    let subject = new DotnetPublishCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run("shaman.json").then(_ => done());
  });

  it('run should ensure project output folder exists', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "dotnet",
          language: "csharp"
        }
      ]
    }));
    let environmentServiceMock = createMock<IEnvironmentService>();
    fileServiceMock.ensureFolderExists = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetPublishCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run("shaman.json").then(_ => {
      expect(fileServiceMock.ensureFolderExists).to.have.been.called;
      done();
    });
  });

  it('run should call buildProject', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "dotnet",
          language: "csharp"
        }
      ]
    }));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.buildProject = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetPublishCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run("shaman.json").then(_ => {
      expect(environmentServiceMock.buildProject).to.have.been.called;
      done();
    });
  });

  it('run should call publishProject', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
      projects: [
        {
          name: "sample",
          path: "sample",
          environment: "dotnet",
          language: "csharp"
        }
      ]
    }));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.publishProject = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetPublishCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run("shaman.json").then(_ => {
      expect(environmentServiceMock.publishProject).to.have.been.called;
      done();
    });
  });

});