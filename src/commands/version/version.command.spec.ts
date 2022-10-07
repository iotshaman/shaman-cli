import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { VersionCommand } from './version.command';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../services/file.service';
import { CommandLineArguments } from '../../command-line-arguments';

describe('Version Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "--version"', () => {
    let subject = new VersionCommand();
    expect(subject.name).to.equal("--version");
  });

  it('run should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ "version": "sample" }));
    let subject = new VersionCommand();
    subject.fileService = fileServiceMock;
    let cla = new CommandLineArguments(['test', 'test', '--version']);
    subject.run(cla).then(_ => done());
  });

  it('run should throw if package file not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
    let subject = new VersionCommand();
    subject.fileService = fileServiceMock;
    let cla = new CommandLineArguments(['test', 'test', '--version']);
    subject.run(cla)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Package file is not in the default location.");
        done();
      });
  });

});