import 'mocha';
import * as sinon from 'sinon';
import * as _cmd from 'child_process';
import { expect } from 'chai';
import { NodeRunCommand } from './node-run.command';
import { Solution, SolutionProject } from '../../../models/solution';

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
    let sampleSolution = new SampleSolution();
    let subject = new NodeRunCommand('start', sampleSolution, './shaman.json');
    expect(subject.name).to.equal("run-node");
  });

  it('run should throw if project file not found', (done) => {
    let sampleSolution = new SampleSolution();
    let subject = new NodeRunCommand('start', sampleSolution, './shaman.json');
    subject.run()
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Project file has not been assigned to run command.");
        done();
      });
  });

  it('run should throw if invalid project provided', (done) => {
    let sampleSolution = new SampleSolution();
    let subject = new NodeRunCommand('start', sampleSolution, './shaman.json');
    let sampleProject: SolutionProject = {
      name: "invalid",
      path: "sample",
      environment: "node",
      template: "server"
    }
    subject.assignProject(sampleProject);
    subject.run()
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid project 'invalid'.");
        done();
      });
  });

  it('run should return resolved promise', (done) => {
    let sampleSolution = new SampleSolution();
    let subject = new NodeRunCommand('start', sampleSolution, './shaman.json');
    let sampleProject: SolutionProject = {
      name: "sample",
      path: "sample",
      environment: "node",
      template: "server"
    }
    subject.assignProject(sampleProject);
    let spawnMock: any = {
      stdout: { on: sandbox.stub().yields("output") },
      stderr: { on: sandbox.stub().yields("error") },
      on: sandbox.stub().yields(0)
    };
    sandbox.stub(_cmd, 'spawn').returns(spawnMock);
    subject.run().then(_ => done());
  });

});

class SampleSolution implements Solution {
  name: string;
  projects: SolutionProject[];

  constructor() {
    this.name = 'sample';
    this.projects = [
      {
        name: "sample",
        path: "sample",
        environment: "node",
        template: "server"
      }
    ]
  }

}
