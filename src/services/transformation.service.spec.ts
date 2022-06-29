import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { ProjectTransformation, Solution, SolutionProject } from '../models/solution';
import { TransformationService } from './transformation.service';
import { ITransformation } from '../transformations/transformation';

describe('Transformation Service', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('performTransformations should return resolved promise if solution has no transformations', (done) => {
    let subject = new TransformationService();
    let solution: Solution = {name: 'sample', projects: null};
    subject.performTransformations(solution, "", []).then(_ => done());
  });

  it('performTransformations should return resolved promise if solution transformations array is empty', (done) => {
    let subject = new TransformationService();
    let solution: Solution = {name: 'sample', projects: []};
    subject.performTransformations(solution, "", []).then(_ => done());
  });

  it('performTransformations should throw if invalid target project provided', (done) => {
    let subject = new TransformationService();
    let solution: Solution = {name: 'sample', projects: [], transform: [{targetProject: 'sample-server', transformation: 'noop'}]};
    subject.performTransformations(solution, "", [])
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid target project in transformation: noop -> sample-server");
        done();
      });
  });

  it('performTransformations should throw if invalid source project provided', (done) => {
    let subject = new TransformationService();
    subject.transformations = [new MockTransformation()];
    let project: SolutionProject = {name: 'sample-server', environment: 'node', path: './server', type: 'server'};
    let solution: Solution = {name: 'sample', projects: [project], transform: [
      {targetProject: 'sample-server', transformation: 'noop', sourceProject: 'invalid'}
    ]};
    subject.performTransformations(solution, "", [])
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid source project in transformation: noop -> invalid");
        done();
      });
  });

  it('performTransformations should throw if invalid tranformation provided', (done) => {
    let subject = new TransformationService();
    let project: SolutionProject = {name: 'sample-server', environment: 'node', path: './server', type: 'server'};
    let solution: Solution = {name: 'sample', projects: [project], transform: [{targetProject: 'sample-server', transformation: 'invalid'}]};
    subject.performTransformations(solution, "", [])
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("Invalid transformation: invalid (node).");
        done();
      });
  });

  it('performTransformations should return resolved promise', (done) => {
    let subject = new TransformationService();
    subject.transformations = [new MockTransformation()];
    let project: SolutionProject = {name: 'sample-server', environment: 'node', path: './server', type: 'server'};
    let solution: Solution = {name: 'sample', projects: [project], transform: [{targetProject: 'sample-server', transformation: 'mock-transformation'}]};
    subject.performTransformations(solution, "", []).then(_ => done());
  });

  it('performTransformations (with source project) should return resolved promise', (done) => {
    let subject = new TransformationService();
    subject.transformations = [new MockTransformation()];
    let project1: SolutionProject = {name: 'sample-server', environment: 'node', path: './server', type: 'server'};
    let project2: SolutionProject = {name: 'sample-database', environment: 'node', path: './database', type: 'database'};
    let solution: Solution = {name: 'sample', projects: [project1, project2], transform: [
      {targetProject: 'sample-server', transformation: 'mock-transformation', sourceProject: 'sample-database'}
    ]};
    subject.performTransformations(solution, "", []).then(_ => done());
  });

  it('performTransformations (with provided project language) should return resolved promise', (done) => {
    let subject = new TransformationService();
    subject.transformations = [new MockTransformation()];
    subject.transformations[0].language = "csharp";
    let project1: SolutionProject = {name: 'sample-server', environment: 'node', path: './server', type: 'server', language: 'csharp'};
    let project2: SolutionProject = {name: 'sample-database', environment: 'node', path: './database', type: 'database'};
    let solution: Solution = {name: 'sample', projects: [project1, project2], transform: [
      {targetProject: 'sample-server', transformation: 'mock-transformation', sourceProject: 'sample-database'}
    ]};
    subject.performTransformations(solution, "", []).then(_ => done());
  });

});

export class MockTransformation implements ITransformation {

  get name(): string { return "mock-transformation"; }
  get environment(): string { return "node"; }

  transform = (_transformation: ProjectTransformation, _solution: Solution, _cwd: string): Promise<void> => {
    return Promise.resolve();
  }

}