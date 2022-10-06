import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { IFileService } from './file.service';
import { RecipeService } from './recipe.service';

describe('Recipe Service', () => {

    var sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(console, 'log');
    })

    afterEach(() => {
        sandbox.restore();
    });

    it('getRecipe should throw if recipe not found', (done) => {
        let subject = new RecipeService();
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(false));
        subject.fileService = fileServiceMock;
        subject.recipesFolder = [__dirname];
        subject.getRecipe('test-recipe')
            .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
            .catch((ex: Error) => {
                expect(ex.message).to.equal("Recipe not found: 'test-recipe'");
                done();
            });
    });

    it('getRecipe should return resolved promise', (done) => {
        let subject = new RecipeService();
        let fileServiceMock = createMock<IFileService>();
        fileServiceMock.pathExists = sandbox.stub().returns(Promise.resolve(true));
        fileServiceMock.readJson = sandbox.stub().returns(Promise.resolve({
            recipe: {
                projects: [{
                    name: "sample-database", environment: "node",
                    type: "database", path: "database"
                },
                {
                    name: "sample-server", environment: "node",
                    type: "server", path: "server",
                    include: ["sample-database", "sample-library"]
                }
                ],
                transform: [{
                    targetProject: "sample-server",
                    transformation: "compose:datacontext",
                    sourceProject: "sample-database"
                }]
            }
        }));
        subject.fileService = fileServiceMock;
        subject.recipesFolder = [__dirname];
        subject.getRecipe('test-recipe').then(_ => done());
    });

});