import { LineDetail } from '../../models/source-file';
import { ISourceFactory } from './source.factory';

export class CsharpSourceFactory implements ISourceFactory {

  buildImportStatement(line: LineDetail, _pathOrPackage: string, importTypes: string[]): LineDetail[] {
    return importTypes.map(importType => {
      return new LineDetail({
        index: line.index,
        content: `using ${importType};`,
        indent: line.indent,
        lifecycleHook: false,
        generated: true
      });
    });
  }

  buildClassProperty(line: LineDetail, propertyName: string, propertyType: string, accessModifier: string = "public"): LineDetail[] {
    return [new LineDetail({
      index: line.index,
      content: `${accessModifier} ${propertyType} ${propertyName};`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    })]
  }

  buildObjectPropertyAssignment(line: LineDetail, _propertyName: string, _propertyValue: string,
    _operator: string = ": ", _suffix: string = ','): LineDetail[] {
    throw new Error("buildObjectPropertyAssignment not implemented for csharp.");
  }

  buildDataContextComposition(line: LineDetail, contextName: string): LineDetail[] {
    let lineDetails: LineDetail[] = [];
    lineDetails.push(new LineDetail({
      index: line.index,
      content: `services.AddDbContext<${contextName}>(options =>`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 1,
      content: `{`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 2,
      content: `var configData = services.BuildServiceProvider().GetService<IOptions<AppConfig>>().Value;`,
      indent: line.indent + 4,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 3,
      content: `options.UseSqlServer(configData.${contextName}ConnectionString,`,
      indent: line.indent + 4,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 4,
      content: `o => { o.EnableRetryOnFailure(4, TimeSpan.FromSeconds(2), null); });`,
      indent: line.indent + 8,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 5,
      content: `});`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 6,
      content: `services.AddScoped<I${contextName}>(i => i.GetService<${contextName}>());`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    return lineDetails;
  }

}