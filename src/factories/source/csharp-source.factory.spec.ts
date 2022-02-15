import 'mocha';
import { expect } from 'chai';
import { CsharpSourceFactory } from './csharp-source.factory';
import { LineDetail } from '../../models/source-file';

describe('Csharp Source Factory', () => {

  it('buildImportStatement should return one import line', () => {
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildImportStatement(line, null, ["SomeNamespace"]);
    expect(result[0].content).to.equal("using SomeNamespace;");
  });

  it('buildClassProperty should return class property line with default access modifier', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildClassProperty(line, "foo", "Bar");
    expect(result[0].content).to.equal("public Bar foo;");
  });

  it('buildClassProperty should return class property line with provided access modifier', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildClassProperty(line, "foo", "Bar", "private");
    expect(result[0].content).to.equal("private Bar foo;");
  });

  it('buildObjectPropertyAssignment should throw', () => {    
    try {
      let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
      let subject = new CsharpSourceFactory();
      subject.buildObjectPropertyAssignment(line, "foo", "Bar");
      throw new Error("Expected subject to throw, but it did not.");
    } catch (ex) {
      expect(ex.message).to.equal("buildObjectPropertyAssignment not implemented for csharp.");
    }
  });

  it('buildDataContextComposition should return db context service provider line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[0].content).to.equal("services.AddDbContext<SampleContext>(options =>");
  });

  it('buildDataContextComposition should return open block scope line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[1].content).to.equal("{");
  });

  it('buildDataContextComposition should return config data value provider line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    const expected = "var configData = services.BuildServiceProvider().GetService<IOptions<AppConfig>>().Value;";
    expect(result[2].content).to.equal(expected);
  });

  it('buildDataContextComposition should return sql user initialization line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[3].content).to.equal("options.UseSqlServer(configData.SampleContextConnectionString,");
  });

  it('buildDataContextComposition should return sql user retry policy line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[4].content).to.equal("o => { o.EnableRetryOnFailure(4, TimeSpan.FromSeconds(2), null); });");
  });

  it('buildDataContextComposition should return closed block scope line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[5].content).to.equal("});");
  });

  it('buildDataContextComposition should return scoped service datacontext provider line', () => {    
    let line = new LineDetail({index: 0, indent: 0, content: '', lifecycleHook: false});
    let subject = new CsharpSourceFactory();
    let result = subject.buildDataContextComposition(line, "SampleContext");
    expect(result[6].content).to.equal("services.AddScoped<ISampleContext>(i => i.GetService<SampleContext>());");
  });

});