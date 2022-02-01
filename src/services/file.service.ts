import * as _fsx from 'fs-extra';
import * as Zip from 'node-stream-zip';
import { Solution } from '../models/solution';

export interface IFileService {
  readJson: <T>(file: string) => Promise<T>;
  writeJson: (file: string, contents: any) => Promise<void>;
  pathExists: (path: string) => Promise<boolean>;
  unzipFile: (file: string, output: string) => Promise<void>;
  deleteFile: (file: string) => Promise<void>;
  getShamanFile: (solutionFilePath: string) => Promise<Solution>;
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

}