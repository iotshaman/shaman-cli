import * as _fsx from 'fs-extra';
import * as _path from 'path';
import * as Zip from 'node-stream-zip';
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
  getSourceFile: (file: string, tabSize?: number) => Promise<SourceFile>;
  renameFile: (file: string, newFile: string) => Promise<void>;
  createFolder: (parentFolderPath: string, folderName: string) => Promise<void>;
  createFolderRecursive: (folderPath: string) => Promise<void>;
  ensureFolderExists: (parentFolderPath: string, folderName: string) => Promise<void>;
  copyFolder: (source: string, destination: string) => Promise<void>;
  copyFile: (source: string, destination: string) => Promise<void>;
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

  getSourceFile = (file: string, tabSize = 2): Promise<SourceFile> => {
    const getIndentLength = (l: string) => {
      if (l.search(/\t/) > -1) l = l.replace(/\t/g, ' '.repeat(tabSize));
      return l.search(/\S/) > -1 ? l.search(/\S/) : 0;
    }
    return this.readFile(file).then(rslt => {
      let fileContentAnalysis = new SourceFile();
      fileContentAnalysis.lines = rslt.split('\n')
      .map((l, i) => new LineDetail({
        index: i, 
        content: l, 
        indent: getIndentLength(l),
        lifecycleHook: l.includes("//shaman:")
      }));
      return fileContentAnalysis;
    });
  }

  renameFile = (file: string, newFile: string): Promise<void> => {
    return _fsx.move(file, newFile);
  }

  createFolder = (parentFolderPath: string, folderName: string): Promise<void> => {
    const folderPath = _path.join(parentFolderPath, folderName);
    return this.pathExists(folderPath).then(exists => {
      if (!!exists) throw new Error(`Folder '${folderName}' already exists in parent directory.`);
      return _fsx.mkdir(folderPath)
    })
  }
  
  createFolderRecursive = (folderPath: string): Promise<void> => {
    return this.pathExists(folderPath).then(exists => {
      if (!!exists) return;
      return _fsx.mkdir(folderPath, { recursive: true });
    })
  }

  ensureFolderExists = (parentFolderPath: string, folderName: string): Promise<void> => {
    const folderPath = _path.join(parentFolderPath, folderName);
    return _fsx.ensureDir(folderPath);
  }

  copyFolder = (source: string, destination: string): Promise<void> => {
    return _fsx.copy(source, destination);
  }

  copyFile = (source: string, destination: string): Promise<void> => {
    return _fsx.copy(source, destination);
  }
}