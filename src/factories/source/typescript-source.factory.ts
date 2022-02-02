import { LineDetail } from '../../models/source-file';
import { ISourceFactory } from './source.factory';

export class TypescriptSourceFactory implements ISourceFactory {

  buildImportStatement(line: LineDetail, pathOrPackage: string, importTypes: string[]): LineDetail[] {
    return [new LineDetail({
      index: line.index,
      line: `import { ${importTypes.join(", ")} } from '${pathOrPackage}';`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    })];
  }

  buildClassProperty(line: LineDetail, propertyText: string): LineDetail[] {
    return [new LineDetail({
      index: line.index,
      line: propertyText,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    })]
  }

  buildDataContextComposition(line: LineDetail, contextName: string): LineDetail[] {
    let lineDetails: LineDetail[] = [];
    lineDetails.push(new LineDetail({
      index: line.index,
      line: `let context = new ${contextName}();`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 1,
      line: `context.initialize(config.mysqlConfig);`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 2,
      line: `container.bind<I${contextName}>(TYPES.${contextName}).toConstantValue(context);`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    return lineDetails;
  }

}