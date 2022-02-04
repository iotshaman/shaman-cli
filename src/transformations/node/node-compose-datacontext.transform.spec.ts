import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { ProjectTransformation, Solution } from '../../models/solution';
import { NodeComposeDataContextTransformation } from "./node-compose-datacontext.transform";
import { ITypescriptSourceService } from "../../services/source/typescript-source.service";

describe('Node Compose DataContext Transformation', () => {
  
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
    let subject = new NodeComposeDataContextTransformation();
    expect(subject.name).to.equal("compose:datacontext");
  });

  it('environment should return "node"', () => {
    let subject = new NodeComposeDataContextTransformation();
    expect(subject.environment).to.equal("node");
  });

  it('transform should throw if invalid project found', (done) => {
    let solution = new Solution();
    solution.projects = [];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "invalid";
    let subject = new NodeComposeDataContextTransformation();
    subject.transform(transformation, solution, "./")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid target project in transformation: 'invalid'.");
        done();
      });
  });

  it('transform should throw if invalid project found', (done) => {
    let solution = new Solution();
    solution.projects = [{name: 'svr', environment: "node", type: "server", path: "./svr"}];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "svr";
    transformation.sourceProject = "invalid"
    let subject = new NodeComposeDataContextTransformation();
    subject.transform(transformation, solution, "./")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Invalid source project in transformation: 'invalid'.");
        done();
      });
  });

  it('transform should call addMySqlAppConfigurationJson', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'svr', environment: "node", type: "server", path: "./svr"},
      {name: 'db', environment: "node", type: "database", path: "./db"}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "svr";
    transformation.sourceProject = "db"
    let typescriptSourceService = createMock<ITypescriptSourceService>();
    typescriptSourceService.addMySqlAppConfigurationJson = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => {
      expect(typescriptSourceService.addMySqlAppConfigurationJson).to.have.been.called;
      done();
    });
  });

  it('transform should call addMySqlAppConfigurationModel', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'svr', environment: "node", type: "server", path: "./svr"},
      {name: 'db', environment: "node", type: "database", path: "./db"}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "svr";
    transformation.sourceProject = "db"
    let typescriptSourceService = createMock<ITypescriptSourceService>();
    typescriptSourceService.addMySqlAppConfigurationModel = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => {
      expect(typescriptSourceService.addMySqlAppConfigurationModel).to.have.been.called;
      done();
    });
  });

  it('transform should call addDataContextCompositionType', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'svr', environment: "node", type: "server", path: "./svr"},
      {name: 'db', environment: "node", type: "database", path: "./db"}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "svr";
    transformation.sourceProject = "db"
    let typescriptSourceService = createMock<ITypescriptSourceService>();
    typescriptSourceService.addDataContextCompositionType = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => {
      expect(typescriptSourceService.addDataContextCompositionType).to.have.been.called;
      done();
    });
  });

  it('transform should call addDataContextComposition', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'svr', environment: "node", type: "server", path: "./svr"},
      {name: 'db', environment: "node", type: "database", path: "./db"}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "svr";
    transformation.sourceProject = "db"
    let typescriptSourceService = createMock<ITypescriptSourceService>();
    typescriptSourceService.addDataContextComposition = sandbox.stub().returns(Promise.resolve());
    let subject = new NodeComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => {
      expect(typescriptSourceService.addDataContextComposition).to.have.been.called;
      done();
    });
  });

  it('transform should call addDataContextCompositionType', (done) => {
    let solution = new Solution();
    solution.projects = [
      {name: 'svr', environment: "node", type: "server", path: "./svr"},
      {name: 'db', environment: "node", type: "database", path: "./db", specs: {contextName: "MyContext"}}
    ];
    let transformation = new ProjectTransformation();
    transformation.targetProject = "svr";
    transformation.sourceProject = "db"
    let typescriptSourceService = createMock<ITypescriptSourceService>();
    typescriptSourceService.addDataContextCompositionType = sandbox.stub().callsFake((_path, _prject, contextName) => {
      expect(contextName).to.equal("MyContext")
    })
    let subject = new NodeComposeDataContextTransformation();
    subject.sourceService = typescriptSourceService;
    subject.transform(transformation, solution, "./").then(_ => done());
  });

});