import 'mocha';
import { expect } from 'chai';
import { ScaffoldSolutionCommand } from './scaffold-solution.command';
import { CommandLineArguments } from '../../command-line-arguments';

describe('Scaffold Solution Command', () => {

  it('name should equal "scaffold-solution"', () => {
    let subject = new ScaffoldSolutionCommand();
    expect(subject.name).to.equal("scaffold-solution");
  });

  it('run should throw', (done) => {
    let subject = new ScaffoldSolutionCommand();
    let cla = new CommandLineArguments(['test', 'test', 'scaffold-solution']);
    subject.run(cla)
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch((ex: Error) => {
        expect(ex.message).to.equal("The scaffold-solution command has been deprecated. Please use the scaffold command instead.");
        done();
      });
  });

});