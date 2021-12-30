import 'mocha';
import { expect } from 'chai';
import { NoopCommand } from './noop.command';

describe('Noop Command', () => {

  it('name should equal "noop"', () => {
    let subject = new NoopCommand();
    expect(subject.name).to.equal("noop");
  });

  it('run should return resolved promise', (done) => {
    let subject = new NoopCommand();
    subject.run().then(_ => done());
  });

})