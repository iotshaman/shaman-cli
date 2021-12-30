import 'mocha';
import { expect } from 'chai';
import { ICommand } from '../command';
import { ScaffoldCommand } from './scaffold.command';

describe('Scaffold Command', () => {

  it('name should equal "scaffold"', () => {
    let subject = new ScaffoldCommand();
    expect(subject.name).to.equal("scaffold");
  });

  it('run should throw error if environment argument not provided', (done) => {
    let subject = new ScaffoldCommand();
    subject.run(null, null, null, null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should throw error if invalid environment provided', (done) => {
    let subject = new ScaffoldCommand();
    subject.scaffoldCommands = [];
    subject.run("node", null, null, null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let subject = new ScaffoldCommand();
    subject.scaffoldCommands = [new NoopScaffoldCommand()];
    subject.run("noop", null, null, null).then(_ => done());
  });

})

class NoopScaffoldCommand implements ICommand {

  get name(): string { return "scaffold-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}