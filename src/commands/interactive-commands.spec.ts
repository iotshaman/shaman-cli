import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as readline from 'readline';
import { assert, expect } from 'chai';
import { createMock } from 'ts-auto-mock';
import { InteractiveCommands, Prompt } from './interactive-commands';
import { buildValidator } from '../factories/validators/validator.factory'

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

    it('interrogate should return key value pair', (done) => {
        let subject = new InteractiveCommands();
        let readlineInterfaceMock = createMock<readline.Interface>();
        readlineInterfaceMock.question = sandbox.stub().callsFake((_, answer) => {
            answer('r');
        });
        readlineInterfaceMock.close = sandbox.stub();
        sandbox.stub(readline, 'createInterface').returns(readlineInterfaceMock);
        let validator = buildValidator(RegExp('^[rRtT]$'))
        let prompt = [new Prompt('test prompt', 'key', validator)];
        let expected = { key: 'r' }
        subject.interrogate(prompt).then(actual => {
            assert.deepEqual(actual, expected);
            done();
        });
    });

    it('interrogate should return multiple key value pairs if provided multiple prompts', (done) => {
        let subject = new InteractiveCommands();
        let readlineInterfaceMock = createMock<readline.Interface>();
        readlineInterfaceMock.question = sandbox.stub()
            .onFirstCall().callsFake((_, answer) => { answer('test-environment') })
            .onSecondCall().callsFake((_, answer) => { answer('test-name') })
            .onThirdCall().callsFake((_, answer) => { answer('test-path') });
        readlineInterfaceMock.close = sandbox.stub();
        sandbox.stub(readline, 'createInterface').returns(readlineInterfaceMock);
        let validator = buildValidator(RegExp('^.*$'))
        let prompts = [
            new Prompt('test environment prompt', 'environment', validator),
            new Prompt('test name prompt', 'name', validator),
            new Prompt('test path prompt', 'path', validator)
        ];
        let expected = { 
            environment: 'test-environment',
            name: 'test-name',
            path: 'test-path'
         }
        subject.interrogate(prompts).then(actual => {
            assert.deepEqual(actual, expected);
            done();
        });
    });

    it('question should recurse if user entry does not match validator', (done) => {
        let subject = new InteractiveCommands();
        let readlineInterfaceMock = createMock<readline.Interface>();
        readlineInterfaceMock.question = sandbox.stub()
            .onFirstCall().callsFake((_, answer) => { answer('no match') })
            .onSecondCall().callsFake((_, answer) => { answer('no match') })
            .onThirdCall().callsFake((_, answer) => { answer('match') });
        readlineInterfaceMock.close = sandbox.stub();
        sandbox.stub(readline, 'createInterface').returns(readlineInterfaceMock);
        let validator = buildValidator(RegExp('^match$'));
        let prompt = [new Prompt('test prompt', 'key', validator)];
        subject.interrogate(prompt).then(_ => {
            expect(readlineInterfaceMock.question).to.be.calledThrice;
            done();
        })
    });

});
