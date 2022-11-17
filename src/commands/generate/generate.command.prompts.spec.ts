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

    it('askForProjectDetails should return a new project', (done) => {
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
            template: 'test-template',
            path: 'test-path'
        }
        subject.askForProjectDetails('test-template').then(actual => {
            assert.deepEqual(actual, expected);
            done();
        });
    });

    it('askToRenameRecipeProjects should return a new recipe renamed projects', (done) => {
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
                template: 'server',
                path: 'server'
            }, {
                name: 'test-database',
                environment: 'node',
                template: 'database',
                path: 'database'
            }]
        }
        let expected: Recipe = {
            projects: [{
                name: 'test-server-rename',
                environment: 'node',
                template: 'server',
                path: 'server'
            }, {
                name: 'test-database-rename',
                environment: 'node',
                template: 'database',
                path: 'database'
            }]
        }
        subject.askToRenameRecipeProjects(testRecipe).then(actual => {
            assert.deepEqual(actual, expected);
            done();
        });
    });

    it('askForTemplateName should return value for template key', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ template: 'test-name' }));
        subject.interaction = interactionMock;
        subject.askForTemplateName().then(rslt => {
            expect(rslt).to.equal('test-name');
            done();
        });
    });

    it('askForSolutionName should return value for solution key', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ solution: 'test-solution' }));
        subject.interaction = interactionMock;
        subject.askForSolutionName().then(rslt => {
            expect(rslt).to.equal('test-solution');
            done();
        });
    });

    it("askIfAddingAnotherProject should return true if interrogate returns value 'y' for addAnother key", (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ addAnother: 'y' }));
        subject.interaction = interactionMock;
        subject.askIfAddingAnotherProject().then(rslt => {
            expect(rslt).to.equal(true);
            done();
        });
    });

    it("askIfAddingAnotherProject should return false if interrogate returns value 'n' for addAnother key", (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ addAnother: 'n' }));
        subject.interaction = interactionMock;
        subject.askIfAddingAnotherProject().then(rslt => {
            expect(rslt).to.equal(false);
            done();
        });
    });

    it('askForRecipe should return value for recipe key', (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ recipe: 'test-recipe' }));
        subject.interaction = interactionMock;
        subject.askForRecipe().then(rslt => {
            expect(rslt).to.equal('test-recipe');
            done();
        });
    });

    it("askForGenerationMethod should return 'recipe' if interrogate returns value 'r' for method key", (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ method: 'r' }));
        subject.interaction = interactionMock;
        subject.askForGenerationMethod().then(rslt => {
            expect(rslt).to.equal('recipe');
            done();
        });
    });

    it("askForGenerationMethod should return 'template' if interrogate returns value 't' for method key", (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ method: 't' }));
        subject.interaction = interactionMock;
        subject.askForGenerationMethod().then(rslt => {
            expect(rslt).to.equal('template');
            done();
        });
    });

    it("askToInstallRequiredTemplates should return true if interrogate returns value 'y' for addRequired key", (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ addRequired: 'y' }));
        subject.interaction = interactionMock;
        subject.askToInstallRequiredTemplates('test-client', ['test-server']).then(rslt => {
            expect(rslt).to.equal(true);
            done();
        });
    });

    it("askToInstallRequiredTemplates should return false if interrogate returns value 'n' for addRequired key", (done) => {
        let subject = new GenerateCommandPrompts();
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({ addRequired: 'n' }));
        subject.interaction = interactionMock;
        subject.askToInstallRequiredTemplates('test-client', ['test-server']).then(rslt => {
            expect(rslt).to.equal(false);
            done();
        });
    });

    it('askForRequiredTemplateDetails should return a project array', (done) => {
        let subject = new GenerateCommandPrompts();
        let templates = [{
            environment: "node",
            name: "test-client",
            version: "1.0.0",
            file: "node/filePath.zip",
            requires: ["test-server"],
        }, {
            environment: "node",
            name: "test-server",
            version: "1.0.0",
            file: "node/filePath.zip",
            requires: ["test-client"]
        }];
        let interactionMock = createMock<InteractiveCommands>();
        interactionMock.interrogate = sandbox.stub().returns(Promise.resolve({
            'test-clientName': 'my-test-client',
            'test-clientPath': 'client',
            'test-serverName': 'my-test-server',
            'test-serverPath': 'server'
        }));
        subject.interaction = interactionMock;
        let expected: SolutionProject[] = [{
            name: 'my-test-client',
            environment: 'node',
            template: 'test-client',
            path: 'client'
        }, {
            name: 'my-test-server',
            environment: 'node',
            template: 'test-server',
            path: 'server'
        }]
        subject.askForRequiredTemplateDetails(templates).then(actual => {
            assert.deepEqual(expected, actual);
            done();
        });
    });

});
