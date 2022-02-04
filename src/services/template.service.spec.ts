import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from './file.service';
import { TemplateService } from './template.service';
import { Template } from '../models/template';

describe('Template Service', () => {
  
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('getTemplate should throw if project type not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({templates: []}));
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.templatesFolder = [__dirname];
    subject.getTemplate("node", "library")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project type not found: node-library");
        done();
      });
  });

  it('getTemplate should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({templates: [{
      environment: 'node', type: 'library', file: 'path.zip'
    }]}));
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.templatesFolder = [__dirname];
    subject.getTemplate("node", "library").then(_ => done());
  });

  it('unzipProjectTemplate should return resolved promise', (done) => {
    let template = new Template();
    template.file = "library.zip";
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.templatesFolder = [__dirname];
    subject.unzipProjectTemplate(template, "library").then(_ => done());
  });

});