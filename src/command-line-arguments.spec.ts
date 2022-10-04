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

    it('getValueOrDefault should return defaultValue if provided (8)', () => {        
        let subject = new CommandLineArguments(['test', 'test', 'command', '--key=value'])    
        expect(subject.getValueOrDefault('key', 8)).to.equal(8);
    });

    it('getValueOrDefault should return defaultValue if provided (true)', () => {
        let subject = new CommandLineArguments(['test', 'test', 'command', '--key=value'])    
        expect(subject.getValueOrDefault('key', true)).to.equal(true);
    });

    it("getValueOrDefault should return defaultValue if provided ('otherValue')", () => {
        let subject = new CommandLineArguments(['test', 'test', 'command', '--key=value'])    
        expect(subject.getValueOrDefault('key', 'otherValue')).to.equal('otherValue');
    });

});