import 'mocha';
import * as sinon from 'sinon';
import * as _fsx from 'fs-extra';
import * as _cmd from 'child_process';
import { FileService } from './file.service';
import { expect } from 'chai';

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

  it('readFile should return promise', (done) => {
    let response = new Promise(res => res(""));
    sandbox.stub(_fsx, 'readFile').returns(<any>response);
    let subject = new FileService();
    subject.readFile("test.json").then(_ => done());
  });

  it('deleteFile should return promise', (done) => {
    let response = new Promise(res => res(null));
    sandbox.stub(_fsx, 'remove').returns(<any>response);
    let subject = new FileService();
    subject.deleteFile("test.json").then(_ => done());
  });

  it('getShamanFile should throw if no file found', (done) => {
    sandbox.stub(_fsx, 'pathExists').returns(<any>Promise.resolve(false));
    let subject = new FileService();
    subject.getShamanFile("shaman.json")
      .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
      .catch(ex => {
        expect(ex.message).to.equal("Solution file does not exist in specified location.");
        done();
      });
  });

  it('getShamanFile should return resolved promise', (done) => {
    sandbox.stub(_fsx, 'pathExists').returns(<any>Promise.resolve(true));
    sandbox.stub(_fsx, 'readJSON').returns(<any>Promise.resolve({projects: []}));
    let subject = new FileService();
    subject.getShamanFile("shaman.json").then(_ => done()).catch(console.dir)
  });

});