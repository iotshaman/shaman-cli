import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { EchoCommand } from './echo.command';
import { CommandLineArguments } from '../../command-line-arguments';

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
    let cla = new CommandLineArguments(['test', 'test', '--version']);
    subject.run(cla).then(_ => done());
  });

})