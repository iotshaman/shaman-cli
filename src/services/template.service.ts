import * as _path from 'path';
import * as os from 'os';
import { TemplateAuthorization } from '../models/solution';
import { Template } from "../models/template";
import { FileService, IFileService } from './file.service';
import { HttpService } from './http.service';

export interface ITemplateService {
  getTemplate: (environment: string, projectType: string, language?: string) => Promise<Template>;
  getCustomTemplate: (environment: string, projectType: string, solution: TemplateAuthorization, language?: string) => Promise<Template>
  unzipProjectTemplate: (template: Template, folderPath: string) => Promise<void>;
  unzipCustomProjectTemplate: (template: Template, folderPath: string) => Promise<void>;
}

export class TemplateService extends HttpService implements ITemplateService {

  constructor() {
    // TODO: move to a config file?
    super('http://localhost:3000/api/projectTemplate');
  }

  fileService: IFileService = new FileService();
  templatesFolder: string[] = [__dirname, '..', '..', 'templates'];

  getTemplate = (environment: string, projectType: string, language?: string): Promise<Template> => {
    let path = _path.join(...this.templatesFolder, 'templates.json');
    return this.fileService.readJson<{ templates: Template[] }>(path).then(data => {
      let template = !language ?
        data.templates.find(t => t.environment == environment && t.type == projectType) :
        data.templates.find(t => t.environment == environment && t.type == projectType && t.language == language);
      if (!template) throw new Error(`Project type not found: ${environment}-${projectType}`);
      return template;
    });
  }

  getCustomTemplate = (environment: string, projectType: string, auth: TemplateAuthorization, language?: string): Promise<Template> => {
    if (!auth) return Promise.reject(new Error('Authorization object not provided in shaman.json file.'));
    if (!auth.email) return Promise.reject(new Error('Authorization email not provided in shaman.json file.'));
    if (!auth.token) return Promise.reject(new Error('Authorization token not provided in shaman.json file.'));
    let tempFilePath = "";
    let headers = {
      'x-template-environment': environment,
      'x-template-name': projectType,
      'x-template-language': language ? language : "",
      'x-auth-email': auth.email,
      'x-auth-token': auth.token
    }
    return this.buildCustomTemplateFolder(environment, auth.email)
      .then(tempDir => tempFilePath = _path.join(tempDir, `${projectType.replace(/ /g, '-')}.zip`))
      .then(_ => this.downloadTemplate('download', headers, tempFilePath))
      .then(_ => {
        let template = new Template();
        template.environment = environment;
        template.type = projectType;
        template.version = "1.0.0";
        template.file = tempFilePath;
        return template;
      });
  }

  unzipProjectTemplate = (template: Template, folderPath: string): Promise<void> => {
    let templatePath = _path.join(...this.templatesFolder, template.file);
    return this.fileService.unzipFile(templatePath, folderPath);
  }

  unzipCustomProjectTemplate = (template: Template, folderPath: string): Promise<void> => {
    return this.fileService.unzipFile(template.file, folderPath);
  }

  private buildCustomTemplateFolder = (environment: string, userEmail: string): Promise<string> => {
    return new Promise((res, err) => {
      let emailPrefix = userEmail.split('@')[0];
      let tmpDir = _path.join(os.tmpdir(), 'shaman', emailPrefix, environment);
      this.fileService.createFolderRecursive(tmpDir)
        .then(_ => res(tmpDir))
        .catch(err);
    });
  }

}