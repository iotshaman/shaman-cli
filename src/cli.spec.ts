import 'mocha';
import { Invoke } from './cli';

describe('CLI', () => {

  it('Invoke should throw if no arguments provided', (done) => {
    Invoke([])
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('Invoke should throw if invalid command provided', (done) => {
    Invoke(["fail"])
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(_ => done());
  });

  it('Invoke should throw if invalid command provided', (done) => {
    Invoke(["noop"]).then(_ => done());
  });

})