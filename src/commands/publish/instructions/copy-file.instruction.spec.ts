import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from "../../../services/file.service";
import { SolutionProject } from '../../../models/solution';
import { CopyFilePublishInstructionService } from './copy-file.instruction';

describe('Copy File Instruction Service', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('instruction should equal "copy"', () => {
    let subject = new CopyFilePublishInstructionService();
    expect(subject.instruction).to.equal("copy");
  });

  it('processInstruction should call ensureFolderExists', (done) => {
    let fileServiceMock = createMock<IFileService>();
    let project: SolutionProject = {
      name: 'sample',
      template: 'server',
      environment: 'node',
      path: 'sample',
      specs: {publish: [{instruction: 'copy', arguments: ['file.txt']}]}
    };
    fileServiceMock.ensureFolderExists = sandbox.stub().returns(Promise.resolve());
    let subject = new CopyFilePublishInstructionService();
    subject.fileService = fileServiceMock;
    subject.processInstruction("./", null, project).then(_ => {
      expect(fileServiceMock.ensureFolderExists).to.have.been.called;
      done();
    });
  });

  it('processInstruction should call copyFile', (done) => {
    let fileServiceMock = createMock<IFileService>();
    let project: SolutionProject = {
      name: 'sample',
      template: 'server',
      environment: 'node',
      path: 'sample',
      specs: {publish: [{instruction: 'copy', arguments: ['file.txt']}]}
    };
    fileServiceMock.copyFile = sandbox.stub().returns(Promise.resolve());
    let subject = new CopyFilePublishInstructionService();
    subject.fileService = fileServiceMock;
    subject.processInstruction("./", null, project).then(_ => {
      expect(fileServiceMock.copyFile).to.have.been.called;
      done();
    });
  });

});