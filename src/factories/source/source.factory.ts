import { LineDetail } from "../../models/source-file";

export interface ISourceFactory {
  buildImportStatement: (line: LineDetail, pathOrPackage: string, importTypes: string[]) => LineDetail[];
  buildClassProperty: (line: LineDetail, propertyName: string, propertyType: string) => LineDetail[];
  buildObjectPropertyAssignment: (line: LineDetail, propertyName: string, propertyValue: string, 
    operator?: string, suffix?: string) => LineDetail[];
  buildDataContextComposition: (lineDetail: LineDetail, contextName: string) => LineDetail[];
}