import 'mocha';
import { expect } from 'chai';
import { ICommand } from '../command';
import { BuildCommand } from './build.command';

describe('Build Command', () => {

  it('name should equal "scaffold"', () => {
    let subject = new BuildCommand();
    expect(subject.name).to.equal("build");
  });

  it('run should throw error if environment argument not provided', (done) => {
    let subject = new BuildCommand();
    subject.run(null, null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should throw error if invalid environment provided', (done) => {
    let subject = new BuildCommand();
    subject.buildCommands = [];
    subject.run("node", null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let subject = new BuildCommand();
    subject.buildCommands = [new NoopBuildCommand()];
    subject.run("noop", null).then(_ => done());
  });

})

class NoopBuildCommand implements ICommand {

  get name(): string { return "build-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}