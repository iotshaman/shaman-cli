import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { GenerateCommand } from './generate.command';
import { IFileService } from '../../services/file.service';
import { CommandLineArguments } from '../../command-line-arguments';
import { createMock } from 'ts-auto-mock';
import { RecipeService } from '../../services/recipe.service';
import { ScaffoldCommand } from '../scaffold/scaffold.command';

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

    it('run should throw error if name not provided', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate']);
        subject.run(cla)
            .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
            .catch(ex => {
                expect(ex.message).to.equal("Name argument not provided to generate command.");
                done();
            });
    });

    it('run should throw error if shaman.json file already exists', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '--name=test']);
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

    it('run should return resolved promise', (done) => {
        let subject = new GenerateCommand();
        let cla = new CommandLineArguments(['', '', 'generate', '--name=test']);
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        fileServiceMock.writeJson = sandbox.stub().returns(Promise.resolve());
        subject.fileService = fileServiceMock;
        let recipeServiceMock = createMock<RecipeService>();
        recipeServiceMock.getRecipe = sandbox.stub().returns(Promise.resolve({
            projects: [{
                name: "sample-node",
                path: "sample-node",
                environment: "node"
            }]
        }));
        subject.fileService = fileServiceMock;
        let scaffoldCommandMock = createMock<ScaffoldCommand>();
        scaffoldCommandMock.run = sandbox.stub().returns(Promise.resolve());
        subject.scaffoldCommand = scaffoldCommandMock;
        subject.run(cla).then(_ => done());
    });

});