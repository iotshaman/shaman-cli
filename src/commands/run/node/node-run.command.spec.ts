import 'mocha';
import * as sinon from 'sinon';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { NodeRunCommand } from './node-run.command';

describe('Run Node Environment Command', () => {

  var sandbox: sinon.SinonSandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "run-node"', () => {
    let subject = new NodeRunCommand();
    expect(subject.name).to.equal("run-node");
  });

  it('run should throw if solution file not found', (done) => {
    let subject = new NodeRunCommand();
    subject.run("sample", null, "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Solution file has not been assigned to run command.");
        done();
      });
  });

  it('run should throw if invalid project provided', (done) => {
    let subject = new NodeRunCommand();
    subject.assignSolution({name: 'sample', projects: [
      {
        name: "sample",
        path: "sample",
        environment: "node",
        type: "server"
      }
    ]});
    subject.run("invalid", "start", "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise', (done) => {
    let subject = new NodeRunCommand();    
    subject.assignSolution({name: 'sample', projects: [
      {
        name: "sample",
        path: "sample",
        environment: "node",
        type: "server"
      }
    ]});
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    subject.run("sample", "start", "shaman.json").then(_ => done());
  });

})