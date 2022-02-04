import 'mocha';
import { expect } from 'chai';
import { TypescriptSourceFactory } from './typescript-source.factory';
import { LineDetail } from '../../models/source-file';

describe('Typescript Source Factory', () => {

  it('buildImportStatement should return import line', () => {
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new TypescriptSourceFactory();
    let result = subject.buildImportStatement(line, "sample-library", ["Foo", "Bar"]);
    expect(result[0].content).to.equal("import { Foo, Bar } from 'sample-library';");
  });

  it('buildClassProperty should return class property line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new TypescriptSourceFactory();
    let result = subject.buildClassProperty(line, "foo", "Bar");
    expect(result[0].content).to.equal("foo: Bar;");
  });

  it('buildObjectPropertyAssignment should return object property assignment', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new TypescriptSourceFactory();
    let result = subject.buildObjectPropertyAssignment(line, "foo", "Bar");
    expect(result[0].content).to.equal("foo: Bar,");
  });

  it('buildDataContextComposition should return context instantiation line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new TypescriptSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[0].content).to.equal("let context = new SampleContext();");
  });

  it('buildDataContextComposition should return context initialization line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new TypescriptSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[1].content).to.equal("context.initialize(config.mysqlConfig);");
  });

  it('buildDataContextComposition should return context initialization line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new TypescriptSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[2].content).to.equal("container.bind<ISampleContext>(TYPES.SampleContext).toConstantValue(context);");
  });

});