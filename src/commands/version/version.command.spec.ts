import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { VersionCommand } from './version.command';

describe('Version Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "--version"', () => {
    let subject = new VersionCommand();
    expect(subject.name).to.equal("version");
  });

  it('run should return resolved promise', (done) => {
    let subject = new VersionCommand();
    subject.run().then(_ => done());
  });
})