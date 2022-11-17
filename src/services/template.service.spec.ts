import 'mocha';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from './file.service';
import { TemplateService } from './template.service';
import { Template } from '../models/template';
import { TemplateAuthorization } from '../models/solution';

describe('Template Service', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('getTemplate should throw if project template not found', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({ templates: [] }));
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.templatesFolder = [__dirname];
    subject.getTemplate("node", "library")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project template not found: node-library");
        done();
      });
  });

  it('getTemplate should return resolved promise for default language', (done) => {

    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({
      templates: [{
        environment: 'node', name: 'library', file: 'path.zip'
      }]
    }));
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.templatesFolder = [__dirname];
    subject.getTemplate("node", "library").then(_ => done());
  });

  it('getTemplate should return resolved promise for specified language', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({
      templates: [{
        environment: 'dotnet', name: 'library', file: 'path.zip', language: "csharp"
      }]
    }));
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.templatesFolder = [__dirname];
    subject.getTemplate("dotnet", "library", "csharp").then(_ => done());
  });

  it('getCustomTemplate should throw if auth not provided.', (done) => {
    let subject = new TemplateService();
    subject.getCustomTemplate("node", "library", undefined)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Authorization object not provided in shaman.json file.");
        done();
      });
  });

  it('getCustomTemplate should throw if auth.email not provided.', (done) => {
    let subject = new TemplateService();
    let templateAuthorization = new TemplateAuthorization();
    subject.getCustomTemplate("node", "library", templateAuthorization)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Authorization email not provided in shaman.json file.");
        done();
      });
  });

  it('getCustomTemplate should throw if auth.token not provided.', (done) => {
    let subject = new TemplateService();
    let templateAuthorization = new TemplateAuthorization();
    templateAuthorization.email = "test@email.com";
    subject.getCustomTemplate("node", "library", templateAuthorization)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Authorization token not provided in shaman.json file.");
        done();
      });
  });

  it('getCustomTemplate should throw if invalid email provided in auth config.', (done) => {
    let subject = new TemplateService();
    let templateAuthorization = new TemplateAuthorization();
    templateAuthorization.email = "test";
    templateAuthorization.token = "1234";
    subject.getCustomTemplate("node", "library", templateAuthorization)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid email address in authorization config.");
        done();
      });
  });

  it('getCustomTemplate should throw if downloadFile fails.', (done) => {
    let subject = new TemplateService();
    let templateAuthorization = new TemplateAuthorization();
    templateAuthorization.email = "test@email.com", templateAuthorization.token = "token";
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.ensureFolderExists = sandbox.stub().returns(Promise.resolve());
    subject.fileService = fileServiceMock;
    // NOTE: mock fetch instead of private method
    sandbox.stub(subject, <any>"downloadFile").returns(Promise.reject());
    subject.getCustomTemplate("node", "library", templateAuthorization)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal('Failed to download custom template. Please check your shaman.json file ' +
          'and ensure your authorization information is correct and your token is not expired. ' +
          'Also check that your project name and environment are correct.');
        done();
      });
  });

  it('getCustomTemplate should return resolved promise for specified language.', (done) => {
    let subject = new TemplateService();
    let templateAuthorization = new TemplateAuthorization();
    templateAuthorization.email = "test@email.com", templateAuthorization.token = "token";
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.ensureFolderExists = sandbox.stub().returns(Promise.resolve());
    subject.fileService = fileServiceMock;
    // NOTE: mock fetch instead of private method
    sandbox.stub(subject, <any>"downloadFile").returns(Promise.resolve());
    subject.getCustomTemplate("node", "library", templateAuthorization).then(_ => done());
  });

  it('getCustomTemplate should set x-template-language header if language is provided.', (done) => {
    let subject = new TemplateService();
    let templateAuthorization = new TemplateAuthorization();
    templateAuthorization.email = "test@email.com", templateAuthorization.token = "token";
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.ensureFolderExists = sandbox.stub().returns(Promise.resolve());
    subject.fileService = fileServiceMock;
    sandbox.stub(subject, <any>"downloadFile").returns(Promise.resolve());
    subject.getCustomTemplate("dotnet", "library", templateAuthorization, "csharp").then(_ => done());
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

  it('unzipCustomProjectTemplate should return resolved promise', (done) => {
    let template = new Template();
    template.file = "library.zip";
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.unzipFile = sandbox.stub().returns(Promise.resolve());
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.templatesFolder = [__dirname];
    subject.unzipCustomProjectTemplate(template, "library").then(_ => done());
  });

  it('getRequiredTemplates should return an array containing the missing project templates', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({
      templates: [{
        environment: "node",
        name: "test-client",
        version: "1.0.4",
        file: "node/client-typescript-v1.0.4.zip",
        requires: ["test-server", "test-database"]
      }, {
        environment: "node",
        name: "test-server",
        version: "1.0.0",
        file: "node/blog-server-v1.0.0.zip",
        requires: ["test-client", "test-database"]
      }, {
        environment: "node",
        name: "test-database",
        version: "1.0.0",
        file: "node/blog-server-v1.0.0.zip",
        requires: ["test-client", "test-server"]
      }]
    }));
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    let expected: Template[] = [{
      environment: "node",
      name: "test-server",
      version: "1.0.0",
      file: "node/blog-server-v1.0.0.zip",
      requires: ["test-client", "test-database"]
    }, {
      environment: "node",
      name: "test-database",
      version: "1.0.0",
      file: "node/blog-server-v1.0.0.zip",
      requires: ["test-client", "test-server"]
    }];
    subject.getRequiredTemplates('test-client', ['test-server', 'test-database'])
      .then(actual => {
        assert.deepEqual(actual, expected);
        done();
      });
  });

  it('getRequiredTemplates should return resolved promise', (done) => {
    let fileServiceMock = createMock<IFileService>();
    fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({
      templates: [{
        environment: "node",
        name: "test-client",
        version: "1.0.4",
        file: "node/client-typescript-v1.0.4.zip",
        requires: ["test-server", "test-database"]
      }, {
        environment: "node",
        name: "test-server",
        version: "1.0.0",
        file: "node/blog-server-v1.0.0.zip",
        requires: ["test-client", "test-database"]
      }, {
        environment: "node",
        name: "test-database",
        version: "1.0.0",
        file: "node/blog-server-v1.0.0.zip",
        requires: ["test-client", "test-server"]
      }]
    }));
    let subject = new TemplateService();
    subject.fileService = fileServiceMock;
    subject.getRequiredTemplates('test-client', ['test-server', 'test-database']).then(_ => done());
  });

});
