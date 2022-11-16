import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { GenerateCommand } from './generate.command';
import { IFileService } from '../../services/file.service';
import { CommandLineArguments } from '../../command-line-arguments';
import { createMock } from 'ts-auto-mock';
import { IRecipeService } from '../../services/recipe.service';
import { IGenerateCommandPrompts } from './generate.command.prompts';
import { ICommand } from '../command';

describe('Generate Command', () => {

    chai.use(sinonChai);
    var sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, 'log');
    })

    afterEach(() => {
        sandbox.restore();
    });

    it('name should equal "generate"', () => {
        let subject = new GenerateCommand();
        expect(subject.name).to.equal("generate");
    });

    it('run should throw error if generating new shaman.json file when shaman.json already exists', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
        subject.fileService = fileServiceMock;
        subject.run(cla)
            .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
            .catch(ex => {
                expect(ex.message).to.equal(`shaman.json file already exists at './shaman.json'`);
                done();
            });
    });

    it('run should add one project if add flag and template argument are provided', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '-add', '--template=test-template']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
            expect(json.projects.length).to.equal(2);
            return Promise.resolve();
        });
        fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
            name: 'test-shaman-file',
            projects: [{
                name: 'test-client',
                environment: 'node',
                type: 'client',
                path: 'client'
            }]
        }));
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForProjectDetails = sandbox.stub().returns(Promise.resolve({
            name: 'test-server',
            environment: 'node',
            type: 'server',
            path: 'server'
        }));
        subject.prompts = promptsMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => done());
    });

    it("run should add multiple projects if add flag set and user enters 'y' for 1st askIfAddingAnotherProject call", (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '-add']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
            expect(json.projects.length).to.equal(3);
            return Promise.resolve();
        });
        fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
            name: 'test-shaman-file',
            projects: [{
                name: 'test-client',
                environment: 'node',
                type: 'client',
                path: 'client'
            }]
        }));
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForTemplateName = sandbox.stub()
            .onFirstCall().returns(Promise.resolve('test-template-one'))
            .onSecondCall().returns(Promise.resolve('test-template-two'));
        promptsMock.askForProjectDetails = sandbox.stub()
            .onFirstCall().returns(Promise.resolve({
                name: 'test-server',
                environment: 'node',
                type: 'server',
                path: 'server'
            }))
            .onSecondCall().returns(Promise.resolve({
                name: 'test-database',
                environment: 'node',
                type: 'database',
                path: 'database'
            }));
        promptsMock.askIfAddingAnotherProject = sandbox.stub()
            .onFirstCall().returns(Promise.resolve(true))
            .onSecondCall().returns(Promise.resolve(false));
        subject.prompts = promptsMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => {
            expect(promptsMock.askForTemplateName).to.be.calledTwice;
            done()
        });
    });

    it('run should not call prompts.askForSolutionName if --name is provided', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '--name=test-solution']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub();
        promptsMock.askForGenerationMethod = sandbox.stub().returns(Promise.resolve('recipe'));
        promptsMock.askForRecipe = sandbox.stub().returns(Promise.resolve('test-recipe'));
        promptsMock.askToRenameRecipeProjects = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "renamed-sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.prompts = promptsMock;
        let recipeServiceMock = createMock<IRecipeService>();
        recipeServiceMock.getRecipe = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.recipeService = recipeServiceMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => {
            expect(promptsMock.askForSolutionName).to.not.be.called;
            done();
        });
    });

    it('run should use default recipe if user enters nothing in prompts.askForRecipe', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForGenerationMethod = sandbox.stub().returns(Promise.resolve('recipe'));
        promptsMock.askForRecipe = sandbox.stub().returns(Promise.resolve(''));
        promptsMock.askToRenameRecipeProjects = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "renamed-sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.prompts = promptsMock;
        let recipeServiceMock = createMock<IRecipeService>();
        recipeServiceMock.getRecipe = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.recipeService = recipeServiceMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => done());
    });

    it('run should transformations in shaman.json if the selected recipe includes transformations', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().callsFake((_path, json) => {
            expect(json.transform.length).to.equal(1);
            return Promise.resolve();
        });
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForGenerationMethod = sandbox.stub().returns(Promise.resolve('recipe'));
        promptsMock.askForRecipe = sandbox.stub().returns(Promise.resolve('test-recipe'));
        promptsMock.askToRenameRecipeProjects = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "renamed-sample-server",
                environment: "node",
                type: "server",
                path: "server"
            }, {
                name: "renamed-sample-database",
                environment: "node",
                type: "database",
                path: "database"
            }],
            transform: [
                {
                    targetProject: "renamed-sample-server",
                    transformation: "compose:datacontext",
                    sourceProject: "renamed-sample-database"
                }
            ]
        }));
        subject.prompts = promptsMock;
        let recipeServiceMock = createMock<IRecipeService>();
        recipeServiceMock.getRecipe = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "sample-server",
                environment: "node",
                type: "server",
                path: "server"
            }, {
                name: "sample-database",
                environment: "node",
                type: "database",
                path: "database"
            }]
        }));
        subject.recipeService = recipeServiceMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => done());
    });

    it('run should not call prompts.askForGenerationMethod if --recipe is provided', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '--recipe=test-recipe']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForGenerationMethod = sandbox.stub();
        promptsMock.askToRenameRecipeProjects = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "renamed-sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.prompts = promptsMock;
        let recipeServiceMock = createMock<IRecipeService>();
        recipeServiceMock.getRecipe = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.recipeService = recipeServiceMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => {
            expect(promptsMock.askForGenerationMethod).to.not.be.called;
            done();
        });
    });

    it('run should not call prompts.askForRecipe if --recipe is provided', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '--recipe=test-recipe']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForRecipe = sandbox.stub();
        promptsMock.askToRenameRecipeProjects = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "renamed-sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.prompts = promptsMock;
        let recipeServiceMock = createMock<IRecipeService>();
        recipeServiceMock.getRecipe = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.recipeService = recipeServiceMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => {
            expect(promptsMock.askForRecipe).to.not.be.called;
            done();
        });
    });

    it("run should generate from templates if if user enters 't' in prompts.askForGenerationMethod", (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForGenerationMethod = sandbox.stub().returns(Promise.resolve('template'));
        promptsMock.askForTemplateName = sandbox.stub().returns(Promise.resolve('test-template'));
        promptsMock.askForProjectDetails = sandbox.stub().returns(Promise.resolve({
            name: 'test-server',
            environment: 'node',
            type: 'server',
            path: 'server'
        }));
        promptsMock.askIfAddingAnotherProject = sandbox.stub().returns(Promise.resolve(false));
        subject.prompts = promptsMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => done());
    });

    it("run should not call prompts.askForGenerationMethod if --template is provided", (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '--template=test-template']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForGenerationMethod = sandbox.stub();
        promptsMock.askForProjectDetails = sandbox.stub().returns(Promise.resolve({
            name: 'test-server',
            environment: 'node',
            type: 'server',
            path: 'server'
        }));
        promptsMock.askIfAddingAnotherProject = sandbox.stub().returns(Promise.resolve(false));
        subject.prompts = promptsMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => {
            expect(promptsMock.askForGenerationMethod).to.not.be.called;
            done();
        });
    });

    it("run should not call prompts.askForTemplateName if --template is provided", (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '--template=test-template']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForTemplateName = sandbox.stub();
        promptsMock.askForProjectDetails = sandbox.stub().returns(Promise.resolve({
            name: 'test-server',
            environment: 'node',
            type: 'server',
            path: 'server'
        }));
        promptsMock.askIfAddingAnotherProject = sandbox.stub().returns(Promise.resolve(false));
        subject.prompts = promptsMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => {
            expect(promptsMock.askForTemplateName).to.not.be.called;
            done();
        });
    });

    it('run should return resolved promise', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForSolutionName = sandbox.stub().returns(Promise.resolve('test-solution'));
        promptsMock.askForGenerationMethod = sandbox.stub().returns(Promise.resolve('recipe'));
        promptsMock.askForRecipe = sandbox.stub().returns(Promise.resolve('test-recipe'));
        promptsMock.askToRenameRecipeProjects = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "renamed-sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.prompts = promptsMock;
        let recipeServiceMock = createMock<IRecipeService>();
        recipeServiceMock.getRecipe = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "sample-client",
                environment: "node",
                type: "client",
                path: "client"
            }]
        }));
        subject.recipeService = recipeServiceMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => done());
    });

    it('run should return resolved promise if add flag is provided', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '-add']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        fileServiceMock.getShamanFile = sandbox.stub().returns(Promise.resolve({
            name: 'test-shaman-file',
            projects: [{
                name: 'test-client',
                environment: 'node',
                type: 'client',
                path: 'client'
            }]
        }));
        subject.fileService = fileServiceMock;
        let promptsMock = createMock<IGenerateCommandPrompts>();
        promptsMock.askForTemplateName = sandbox.stub().returns(Promise.resolve('test-template'));
        promptsMock.askForProjectDetails = sandbox.stub().returns(Promise.resolve({
            name: 'test-server',
            environment: 'node',
            type: 'server',
            path: 'server'
        }));
        promptsMock.askIfAddingAnotherProject = sandbox.stub().returns(Promise.resolve(false));
        subject.prompts = promptsMock;
        let scaffoldCommandMock = createMock<MockScaffoldCommand>();
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => done());
    });

});

class MockScaffoldCommand implements ICommand {
    get name(): string { return "scaffold"; }

    run = (): Promise<void> => {
        return Promise.resolve();
    };
}
