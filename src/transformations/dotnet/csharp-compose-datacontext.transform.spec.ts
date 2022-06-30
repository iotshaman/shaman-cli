import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ProjectTransformation, Solution } from '../../models/solution';
import { CsharpComposeDataContextTransformation } from "./csharp-compose-datacontext.transform";
import { ICsharpSourceService } from "../../services/source/csharp-source.service";

describe('Csharp Compose DataContext Transformation', () => {
  
  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should return "compose:datacontext"', () => {
    let subject = new CsharpComposeDataContextTransformation();
    expect(subject.name).to.equal("compose:datacontext");
  });

  it('environment should return "dotnet"', () => {
    let subject = new CsharpComposeDataContextTransformation();
    expect(subject.environment).to.equal("dotnet");
  });

  it('language should return "csharp"', () => {
    let subject = new CsharpComposeDataContextTransformation();
    expect(subject.language).to.equal("csharp");
  });

  it('transform should throw if invalid target project found', (done) => {
    let solution = new Solution();
    solution.projects = [];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "invalid";
    let subject = new CsharpComposeDataContextTransformation();
    subject.transform(transformation, solution, "./")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid target project in transformation: 'invalid'.");
        done();
      });
  });

  it('transform should throw if invalid source project found', (done) => {
    let solution = new Solution();
    solution.projects = [{name: 'svr', environment: "node", type: "server", path: "./svr"}];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "svr";
    transformation.sourceProject = "invalid"
    let subject = new CsharpComposeDataContextTransformation();
    subject.transform(transformation, solution, "./")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid source project in transformation: 'invalid'.");
        done();
      });
  });

  it('transform should call addDatabaseConnectionStringToAppsettingsJson', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'Svr', environment: "dotnet", type: "server", path: "./svr", language: "csharp"},
      {name: 'Db', environment: "dotnet", type: "database", path: "./Db", language: "csharp"}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "Svr";
    transformation.sourceProject = "Db"
    let typescriptSourceService = createMock<ICsharpSourceService>();
    typescriptSourceService.addDatabaseConnectionStringToAppsettingsJson = sandbox.stub().returns(Promise.resolve());
    let subject = new CsharpComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => {
      expect(typescriptSourceService.addDatabaseConnectionStringToAppsettingsJson).to.have.been.called;
      done();
    });
  });

  it('transform should call addConnectionStringToAppConfig', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'Svr', environment: "dotnet", type: "server", path: "./svr", language: "csharp"},
      {name: 'Db', environment: "dotnet", type: "database", path: "./Db", language: "csharp"}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "Svr";
    transformation.sourceProject = "Db"
    let typescriptSourceService = createMock<ICsharpSourceService>();
    typescriptSourceService.addConnectionStringToAppConfig = sandbox.stub().returns(Promise.resolve());
    let subject = new CsharpComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => {
      expect(typescriptSourceService.addConnectionStringToAppConfig).to.have.been.called;
      done();
    });
  });

  it('transform should call addDataContextComposition', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'Svr', environment: "dotnet", type: "server", path: "./svr", language: "csharp"},
      {name: 'Db', environment: "dotnet", type: "database", path: "./Db", language: "csharp",
        specs: {contextName: "MyContext"}}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "Svr";
    transformation.sourceProject = "Db"
    let typescriptSourceService = createMock<ICsharpSourceService>();
    typescriptSourceService.addDataContextComposition = sandbox.stub().returns(Promise.resolve());
    let subject = new CsharpComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => {
      expect(typescriptSourceService.addDataContextComposition).to.have.been.called;
      done();
    });
  });

});