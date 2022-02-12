import 'mocha';
import * as sinon from 'sinon';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { DotnetRunCommand } from './dotnet-run.command';

describe('Run Dotnet Environment Command', () => {

  var sandbox: sinon.SinonSandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "run-dotnet"', () => {
    let subject = new DotnetRunCommand();
    expect(subject.name).to.equal("run-dotnet");
  });

  it('run should throw if solution file not found', (done) => {
    let subject = new DotnetRunCommand();
    subject.run("sample", null, "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Solution file has not been assigned to run command.");
        done();
      });
  });

  it('run should throw if invalid project provided', (done) => {
    let subject = new DotnetRunCommand();
    subject.assignSolution({name: 'sample', projects: [
      {
        name: "sample",
        path: "sample",
        environment: "dotnet",
        type: "server",
        language: "csharp"
      }
    ]});
    subject.run("invalid", null, "shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise', (done) => {
    let subject = new DotnetRunCommand();    
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
    subject.run("sample", null, "shaman.json").then(_ => done());
  });

})