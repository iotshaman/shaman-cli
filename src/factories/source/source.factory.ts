import { LineDetail } from "../../models/source-file";

export interface ISourceFactory {
  buildImportStatement: (line: LineDetail, pathOrPackage: string, importTypes: string[]) => LineDetail[];
  buildClassProperty: (line: LineDetail, propertyText: string) => LineDetail[];
  buildDataContextComposition: (lineDetail: LineDetail, contextName: string) => LineDetail[];
}