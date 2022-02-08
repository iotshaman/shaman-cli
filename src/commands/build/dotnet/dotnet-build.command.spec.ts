import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { DotnetBuildCommand } from './dotnet-build.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';

describe('Dotnet Build Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "build-dotnet"', () => {
    let subject = new DotnetBuildCommand();
    expect(subject.name).to.equal("build-dotnet");
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: []}));
    let subject = new DotnetBuildCommand();
    subject.fileService = fileServiceMock;
    subject.run(null, "shaman.json").then(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: [
      {
        name: "sample",
        path: "sample",
        environment: "dotnet",
        language: "csharp"
      }
    ]}));
    let environmentServiceMock = createMock<IEnvironmentService>();
    environmentServiceMock.buildProject = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetBuildCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run(null, "./shaman.json").then(_ => done());
  });

});