import 'mocha';
import { expect } from 'chai';

import { CommandLineArguments } from './command-line-arguments';

describe('Command Line Arguments', () => {

    it('constructor should throw if no command provided', () => {
        let func = () => { new CommandLineArguments(['test', 'test']) }
        expect(func).to.throw('No command provided.');
    });

    it('constructor should throw if invalid argument provided (-key=value)', () => {
        let func = () => { new CommandLineArguments(['test', 'test', 'command', '-key=value']) }
        expect(func).to.throw("Invalid argument :: -key=value");
    });

    it('constructor should throw if invalid argument provided (--key-value)', () => {
        let func = () => { new CommandLineArguments(['test', 'test', 'command', '--key-value']) }
        expect(func).to.throw("Invalid argument :: --key-value");
    });

    it('constructor should throw if invalid argument provided (--key=)', () => {
        let func = () => { new CommandLineArguments(['test', 'test', 'command', '--key=']) }
        expect(func).to.throw("Invalid argument :: --key=");
    });

    it('constructor should not throw', () => {
        let func = () => { new CommandLineArguments(['test', 'test', 'command', '--key=value']) }
        expect(func).to.not.throw();
    });

    it('getFlag should return false if a flag is not provided', () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getFlag('-add')).to.equal(false);
    });

    it('getFlag should return true if a flag is provided', () => {
        let subject = new CommandLineArguments(['test', 'test', 'command', '-add']);
        expect(subject.getFlag('-add')).to.equal(true);
    });

    it('getValueOrDefault should return defaultValue if provided (8)', () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getValueOrDefault('testKey', 8)).to.equal(8);
    });

    it('getValueOrDefault should return defaultValue if provided (true)', () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getValueOrDefault('testKey', true)).to.equal(true);
    });

    it("getValueOrDefault should return defaultValue if provided ('otherValue')", () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getValueOrDefault('testKey', 'otherValue')).to.equal('otherValue');
    });

    it("getValueOrDefault should return defaultValue '*' for 'environment'", () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getValueOrDefault('environment')).to.equal('*');
    });

    it("getValueOrDefault should return defaultValue './shaman.json' for 'filePath'", () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getValueOrDefault('filePath')).to.equal('./shaman.json');
    });

    it("getValueOrDefault should return defaultValue 'start' for 'script'", () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getValueOrDefault('script')).to.equal('start');
    });

    it("getValueOrDefault should return defaultValue 'No echo string provided.' for 'echo'", () => {
        let subject = new CommandLineArguments(['test', 'test', 'command']);
        expect(subject.getValueOrDefault('echo')).to.equal('No echo string provided.');
    });

});