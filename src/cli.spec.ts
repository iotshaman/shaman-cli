import 'mocha';
import { Invoke } from './cli';

describe('CLI', () => {

  it('Invoke should throw if no arguments provided', (done) => {
    Invoke([])
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('Invoke should throw if invalid command provided', (done) => {
    Invoke(["test", "test", "fail"])
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('Invoke should resolve if valid command provided', (done) => {
    Invoke(["test", "test", "noop"]).then(_ => done());
  });

})