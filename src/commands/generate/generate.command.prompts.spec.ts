import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { assert, expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { GenerateCommandPrompts } from './generate.command.prompts';
import { Recipe } from '../../models/recipe';
import { SolutionProject } from '../../models/solution';
import { InteractiveCommands } from '../interactive-commands';

describe('Generate Command Prompts', () => {

    chai.use(sinonChai);
    var sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, 'log');
    })

    afterEach(() => {
        sandbox.restore();
    });

    it('askForProjectDetails should return a new project matching user input', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({
            name: 'test-name',
            environment: 'test-environment',
            path: 'test-path'
        }));
        subject.interaction = interactionMock;
        let expected: SolutionProject = {
            name: 'test-name',
            environment: 'test-environment',
            type: 'test-type',
            path: 'test-path'
        }
        subject.askForProjectDetails('test-type').then(actual => {
            assert.deepEqual(actual, expected);
            done();
        });
    });
    
    it('askToRenameRecipeProjects', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({
            'test-server': 'test-server-rename',
            'test-database': 'test-database-rename'
        }));
        subject.interaction = interactionMock;
        let testRecipe: Recipe = {
            projects: [{
                name: 'test-server',
                environment: 'node',
                type: 'server',
                path: 'server'
            },{
                name: 'test-database',
                environment: 'node',
                type: 'database',
                path: 'database'
            }]
        }
        let expected: Recipe = {
            projects: [{
                name: 'test-server-rename',
                environment: 'node',
                type: 'server',
                path: 'server'
            },{
                name: 'test-database-rename',
                environment: 'node',
                type: 'database',
                path: 'database'
            }]
        }
        subject.askToRenameRecipeProjects(testRecipe).then(actual => {
            assert.deepEqual(actual, expected);
            done();
        });
    });

    it('askForTemplateName', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({template: 'test-name'}));
        subject.interaction = interactionMock;
        subject.askForTemplateName().then(rslt => {
            expect(rslt).to.equal('test-name');
            done();
        });
    });

    it('askForSolutionName', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({solution: 'test-solution'}));
        subject.interaction = interactionMock;
        subject.askForSolutionName().then(rslt => {
            expect(rslt).to.equal('test-solution');
            done();
        });
    });

    it('askIfAddingAnotherProject true', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({addAnother: 'y'}));
        subject.interaction = interactionMock;
        subject.askIfAddingAnotherProject().then(rslt => {
            expect(rslt).to.equal(true);
            done();
        });
    });

    it('askIfAddingAnotherProject false', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({addAnother: 'n'}));
        subject.interaction = interactionMock;
        subject.askIfAddingAnotherProject().then(rslt => {
            expect(rslt).to.equal(false);
            done();
        });
    });

    it('askForRecipe', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({recipe: 'test-recipe'}));
        subject.interaction = interactionMock;
        subject.askForRecipe().then(rslt => {
            expect(rslt).to.equal('test-recipe');
            done();
        });
    });

    it('askForGenerationMethod recipe', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({method: 'r'}));
        subject.interaction = interactionMock;
        subject.askForGenerationMethod().then(rslt => {
            expect(rslt).to.equal('recipe');
            done();
        });
    });

    it('askForGenerationMethod template', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({method: 't'}));
        subject.interaction = interactionMock;
        subject.askForGenerationMethod().then(rslt => {
            expect(rslt).to.equal('template');
            done();
        });
    });

});
