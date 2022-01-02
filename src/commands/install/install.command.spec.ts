import 'mocha';
import { expect } from 'chai';
import { ICommand } from '../command';
import { InstallCommand } from './install.command';

describe('Install Command', () => {

  it('name should equal "install"', () => {
    let subject = new InstallCommand();
    expect(subject.name).to.equal("install");
  });

  it('run should throw error if environment argument not provided', (done) => {
    let subject = new InstallCommand();
    subject.run(null, null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should throw error if invalid environment provided', (done) => {
    let subject = new InstallCommand();
    subject.installCommands = [];
    subject.run("node", null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('run should return resolved promise', (done) => {
    let subject = new InstallCommand();
    subject.installCommands = [new NoopInstallCommand()];
    subject.run("noop", null).then(_ => done());
  });

})

class NoopInstallCommand implements ICommand {

  get name(): string { return "install-noop"; }

  run = (): Promise<void> => {
    return Promise.resolve();
  }
}