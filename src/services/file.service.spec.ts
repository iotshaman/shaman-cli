import 'mocha';
import * as sinon from 'sinon';
import * as _fsx from 'fs-extra';
import * as _cmd from 'child_process';
import { FileService } from './file.service';

describe('File Service', () => {

  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  it('readJson should return promise', (done) => {
    let response = new Promise(res => res(null));
    sandbox.stub(_fsx, 'readJSON').returns(<any>response);
    let subject = new FileService();
    subject.readJson("test.json").then(_ => done());
  });

  it('writeJson should return promise', (done) => {
    let response = new Promise(res => res(null));
    sandbox.stub(_fsx, 'writeFile').returns(<any>response);
    let subject = new FileService();
    subject.writeJson("test.json", {}).then(_ => done());
  });

  it('pathExists should return promise', (done) => {
    let response = new Promise(res => res(null));
    sandbox.stub(_fsx, 'pathExists').returns(<any>response);
    let subject = new FileService();
    subject.pathExists("test.json").then(_ => done());
  });

});