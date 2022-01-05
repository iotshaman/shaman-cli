import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { EchoCommand } from './echo.command';

describe('Echo Command', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "echo"', () => {
    let subject = new EchoCommand();
    expect(subject.name).to.equal("echo");
  });

  it('run should return resolved promise', (done) => {
    let subject = new EchoCommand();
    subject.run().then(_ => done());
  });

})