import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { ICommand } from '../command';
import { createMock } from 'ts-auto-mock';
import { IFileService } from '../../services/file.service';
import { PublishCommand } from './publish.command';

describe('Publish Command', () => { 
    
    chai.use(sinonChai);
    var sandbox: sinon.SinonSandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(console, 'log');
    });
  
    afterEach(() => {
      sandbox.restore();
    });

    it('name should equal "publish"', () => {
        let subject = new PublishCommand();
        expect(subject.name).to.equal("publish");
    });

    it('publish.createFileTree should create the bin folder', (done) => {
      let subject = new PublishCommand();
      // subject.
    });

});