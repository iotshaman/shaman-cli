import { LineDetail } from '../../models/source-file';
import { ISourceFactory } from './source.factory';

export class TypescriptSourceFactory implements ISourceFactory {

  buildImportStatement(line: LineDetail, pathOrPackage: string, importTypes: string[]): LineDetail[] {
    return [new LineDetail({
      index: line.index,
      content: `import { ${importTypes.join(", ")} } from '${pathOrPackage}';`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    })];
  }

  buildClassProperty(line: LineDetail, propertyName: string, propertyType: string): LineDetail[] {
    return [new LineDetail({
      index: line.index,
      content: `${propertyName}: ${propertyType};`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    })]
  }

  buildObjectPropertyAssignment(line: LineDetail, propertyName: string, propertyValue: string,
    operator: string = ": ", suffix: string = ','): LineDetail[] {
    return [new LineDetail({
      index: line.index,
      content: `${propertyName}${operator}${propertyValue}${suffix}`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    })]
  }

  buildDataContextComposition(line: LineDetail, contextName: string): LineDetail[] {
    let lineDetails: LineDetail[] = [];
    lineDetails.push(new LineDetail({
      index: line.index,
      content: `let context = new ${contextName}();`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 1,
      content: `context.initialize(config.mysqlConfig);`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    lineDetails.push(new LineDetail({
      index: line.index + 2,
      content: `container.bind<I${contextName}>(TYPES.${contextName}).toConstantValue(context);`,
      indent: line.indent,
      lifecycleHook: false,
      generated: true
    }));
    return lineDetails;
  }

}