import 'mocha';
import { expect } from 'chai';
import { ScaffoldSolutionCommand } from './scaffold-solution.command';

describe('Scaffold Command', () => {

  it('name should equal "scaffold"', () => {
    let subject = new ScaffoldCommand();
    expect(subject.name).to.equal("scaffold");
  });

  it('run should throw', (done) => {
    let subject = new ScaffoldCommand();
    subject.run(null, null, null, null)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("The scaffold command has been deprecated. Please use the scaffold-solution command instead.");
        done();
      });
  });

});