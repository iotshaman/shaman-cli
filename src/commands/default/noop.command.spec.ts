import 'mocha';
import { expect } from 'chai';
import { NoopCommand } from './noop.command';
import { CommandLineArguments } from '../../command-line-arguments';

describe('Noop Command', () => {

  it('name should equal "noop"', () => {
    let subject = new NoopCommand();
    expect(subject.name).to.equal("noop");
  });

  it('run should return resolved promise', (done) => {
    let subject = new NoopCommand();
    let cla = new CommandLineArguments(['test', 'test', 'noop']);
    subject.run(cla).then(_ => done());
  });

})