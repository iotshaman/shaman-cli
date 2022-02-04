import 'mocha';
import { expect } from 'chai';
import { SourceFile, LineDetail } from './source-file';

const importHook = `//shaman: {"lifecycle": "transformation", "args": {"type": "import", "target": "*"}}`;

describe('Source File', () => {

  it('replaceLines should add new lines from factory', () => {
    const lines: LineDetail[] = [new LineDetail({index: 0, content: '', indent: 0, lifecycleHook: false})];
    const sourceFile = new SourceFile();
    const lineFactory = () => ([new LineDetail({index: -1, content: '', indent: 0, lifecycleHook: false, generated: true})]);
    sourceFile.lines = lines;
    sourceFile.replaceLines(lines[0].indent, lineFactory);
    expect(sourceFile.lines.length).to.equal(2);
  });

  it('replaceLines should update line indexes', () => {
    const lines: LineDetail[] = [new LineDetail({index: 0, content: '', indent: 0, lifecycleHook: false})];
    const sourceFile = new SourceFile();
    const lineFactory = () => ([new LineDetail({index: 99, content: '', indent: 0, lifecycleHook: false, generated: true})]);
    sourceFile.lines = lines;
    sourceFile.replaceLines(lines[0].indent, lineFactory);
    expect(sourceFile.lines.map(l => l.index).join(",")).to.equal("0,1");
  });

  it('toString should add indents for generated lines', () => {
    const lines: LineDetail[] = [new LineDetail({index: 0, content: 'const test = 1;', indent: 2, lifecycleHook: false, generated: true})];
    const sourceFile = new SourceFile();
    sourceFile.lines = lines;
    const result = sourceFile.toString();
    expect(result).to.equal("  const test = 1;\r\n");
  });

  it('toString should add new line for generated lines', () => {
    const lines: LineDetail[] = [new LineDetail({index: 0, content: 'const test = 1;', indent: 2, lifecycleHook: false, generated: true})];
    const sourceFile = new SourceFile();
    sourceFile.lines = lines;
    const result = sourceFile.toString();
    expect(result).to.equal("  const test = 1;\r\n");
  });

  it('transformationLines should return empty array if no lines in source file', () => {
    const sourceFile = new SourceFile();
    sourceFile.lines = null;
    expect(sourceFile.transformationLines.length).to.equal(0);
  });

  it('transformationLines should return import hook transformation line', () => {
    const lines: LineDetail[] = [new LineDetail({index: 0, content: importHook, indent: 2, lifecycleHook: true})];
    const sourceFile = new SourceFile();
    sourceFile.lines = lines;
    expect(sourceFile.transformationLines.length).to.equal(1);
  });

});

describe('Line Detail', () => {

  it('constructor should not apply seed data if none provided', () => {
    const subject = new LineDetail();
    expect(subject.content).to.be.undefined;
  });

  it('constructor should apply seed data when provided', () => {
    const subject = new LineDetail({index: 0, content: 'test', indent: 0, lifecycleHook: false});
    expect(subject.content).not.to.be.undefined;
  });

  it('lifecycleHookData getter should return default values if line is not lifecycle hook', () => {
    const subject = new LineDetail({index: 0, content: 'test', indent: 0, lifecycleHook: false});
    expect(subject.lifecycleHookData.lifecycle).to.equal("none");
  });

  it('lifecycleHookData getter should return transformation lifecycle hook', () => {
    const subject: LineDetail = new LineDetail({index: 0, content: importHook, indent: 2, lifecycleHook: true});
    expect(subject.lifecycleHookData.lifecycle).to.equal("transformation");
  });

  it('lifecycleHookData getter should return default values if bad json provided to hook', () => {
    const subject = new LineDetail({index: 0, content: '//shaman: {bad json}', indent: 0, lifecycleHook: true});
    expect(subject.lifecycleHookData.lifecycle).to.equal("none");
  });

});