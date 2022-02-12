import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../../services/file.service';
import { DotnetInstallCommand } from './dotnet-install.command';
import { IEnvironmentService } from '../../../services/environments/environment.service';

describe('Install Dotnet Environment Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "install-dotnet"', () => {
    let subject = new DotnetInstallCommand();
    expect(subject.name).to.equal("install-dotnet");
  });

  it('run should return resolved promise if no projects defined', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({projects: []}));
    let subject = new DotnetInstallCommand();
    subject.fileService = fileServiceMock;
    subject.run(null, "./shaman.json").then(_ => done());
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
    environmentServiceMock.installDependencies = sandbox.stub().returns(Promise.resolve());
    let subject = new DotnetInstallCommand();
    subject.fileService = fileServiceMock;
    subject.environmentService = environmentServiceMock;
    subject.run(null, "./shaman.json").then(_ => done());
  });

});