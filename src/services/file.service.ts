import * as _fsx from 'fs-extra';
import * as _path from 'path';
import * as Zip from 'node-stream-zip';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { Solution } from '../models/solution';
import { LineDetail, SourceFile } from '../models/source-file';

export interface IFileService {
  readJson: <T>(file: string) => Promise<T>;
  writeJson: (file: string, contents: any) => Promise<void>;
  pathExists: (path: string) => Promise<boolean>;
  readFile: (file: string) => Promise<string>;
  writeFile: (file: string, contents: string) => Promise<void>;
  unzipFile: (file: string, output: string) => Promise<void>;
  deleteFile: (file: string) => Promise<void>;
  getShamanFile: (solutionFilePath: string) => Promise<Solution>;
  getSourceFile: (file: string) => Promise<SourceFile>;
  renameFile: (file: string, newFile: string) => Promise<void>;
  readXml: <T>(file: string) => Promise<T>;
  writeXml: (file: string, jsonObject: any) => Promise<void>;
  createFolder: (parentFolderPath: string, folderName: string) => Promise<void>;
}

export class FileService implements IFileService {

  readJson = <T>(file: string): Promise<T> => {
    return _fsx.readJSON(file);
  }

  writeJson = (file: string, contents: any): Promise<void> => {
    return _fsx.writeFile(file, JSON.stringify(contents, null, '\t'));
  }

  pathExists = (path: string): Promise<boolean> => {
    return _fsx.pathExists(path);
  }

  readFile = (file: string): Promise<string> => {
    return _fsx.readFile(file).then(buffer => buffer.toString());
  }

  writeFile = (file: string, contents: string): Promise<void> => {
    return _fsx.writeFile(file, contents);
  }
  
  /* istanbul ignore next */
  unzipFile = (file: string, output: string): Promise<void> => {
    return new Promise((res, err) => {
      const zip = new Zip({file, storeEntries: true});
      zip.on('ready', () => {
        zip.extract(null, output, ex => {
          zip.close();
          if (ex) return err(ex);
          res();
        });
      });
    });
  }

  deleteFile = (file: string): Promise<void> => {
    return _fsx.remove(file);
  }

  getShamanFile = (solutionFilePath: string): Promise<Solution> => {
    return this.pathExists(solutionFilePath).then(exists => {
      if (!exists) throw new Error("Solution file does not exist in specified location.");
      return this.readJson<Solution>(solutionFilePath);
    });
  }

  getSourceFile = (file: string): Promise<SourceFile> => {
    return this.readFile(file).then(rslt => {
      let fileContentAnalysis = new SourceFile();
      fileContentAnalysis.lines = rslt.split('\n')
      .map((l, i) => new LineDetail({
        index: i, 
        content: l, 
        indent: l.search(/\S/) > -1 ? l.search(/\S/) : 0,
        lifecycleHook: l.includes("//shaman:")
      }));
      return fileContentAnalysis;
    });
  }

  renameFile = (file: string, newFile: string): Promise<void> => {
    return _fsx.move(file, newFile);
  }

  readXml = <T>(file: string): Promise<T> => {
    return this.readFile(file).then(contents => {
      const parser = new XMLParser({
        ignoreAttributes: false, 
        preserveOrder: true,
        attributeNamePrefix : "@_"
      });
      return parser.parse(contents);
    });
  }

  writeXml = (file: string, jsonObject: any): Promise<void> => {
    return Promise.resolve().then(_ => {
      const builder = new XMLBuilder({
        format: true, 
        ignoreAttributes: false, 
        preserveOrder: true,
        attributeNamePrefix : "@_"
      });
      const xmlString: string = builder.build(jsonObject);
      return this.writeFile(file, xmlString.trim());
    });
  }

  createFolder = (parentFolderPath: string, folderName: string): Promise<void> => {
    const folderPath = _path.join(parentFolderPath, folderName);
    return this.pathExists(folderPath).then(exists => {
      if (!!exists) throw new Error(`Folder '${folderName}' already exists in parent directory.`);
      return _fsx.mkdir(folderPath)
    })
  }

}