import * as _path from 'path';
import * as os from 'os';
import { TemplateAuthorization } from '../models/solution';
import { Template } from "../models/template";
import { FileService, IFileService } from './file.service';
import { HttpService } from './http.service';

export interface ITemplateService {
  getTemplate: (environment: string, projectTemplate: string, language?: string) => Promise<Template>;
  getCustomTemplate: (environment: string, projectTemplate: string, solution: TemplateAuthorization, language?: string) => Promise<Template>
  getRequiredTemplates: (dependent: string, missingRequirements: string[]) => Promise<Template[]>;
  unzipProjectTemplate: (template: Template, folderPath: string) => Promise<void>;
  unzipCustomProjectTemplate: (template: Template, folderPath: string) => Promise<void>;
}

export class TemplateService extends HttpService implements ITemplateService {

  constructor() {
    super('http://localhost:3000/api/projectTemplate');
  }

  fileService: IFileService = new FileService();
  templatesFolder: string[] = [__dirname, '..', '..', 'templates'];

  getTemplate = (environment: string, projectTemplate: string, language?: string): Promise<Template> => {
    let path = _path.join(...this.templatesFolder, 'templates.json');
    return this.fileService.readJson<{ templates: Template[] }>(path).then(data => {
      let template = !language ?
        data.templates.find(t => t.environment == environment && t.name == projectTemplate) :
        data.templates.find(t => t.environment == environment && t.name == projectTemplate && t.language == language);
      if (!template) throw new Error(`Project template not found: ${environment}-${projectTemplate}`);
      return template;
    });
  }

  getCustomTemplate = (environment: string, projectTemplate: string, auth?: TemplateAuthorization, language?: string): Promise<Template> => {
    if (!auth) return Promise.reject(new Error('Authorization object not provided in shaman.json file.'));
    if (!auth.email) return Promise.reject(new Error('Authorization email not provided in shaman.json file.'));
    if (!auth.token) return Promise.reject(new Error('Authorization token not provided in shaman.json file.'));
    if (!auth.email.includes('@')) return Promise.reject(new Error("Invalid email address in authorization config."));
    let tempFilePath = "";
    let headers = {
      'x-template-environment': environment,
      'x-template-name': projectTemplate,
      'x-template-language': language ? language : "",
      'x-auth-email': auth.email,
      'x-auth-token': auth.token
    }
    return this.buildCustomTemplateFolder(environment, auth.email)
      .then(tempDir => tempFilePath = _path.join(tempDir, `${projectTemplate.replace(/ /g, '-')}.zip`))
      .then(_ => this.downloadFile('download', tempFilePath, headers))
      .then(_ => {
        let template = new Template();
        template.environment = environment;
        template.name = projectTemplate;
        template.version = "1.0.0";
        template.file = tempFilePath;
        return template;
      })
      .catch(_ => {
        return Promise.reject(new Error('Failed to download custom template. Please check your shaman.json file ' +
        'and ensure your authorization information is correct and your token is not expired. ' +
        'Also check that your project name and environment are correct.'));
      });
  }

  getRequiredTemplates = (dependent: string, missingRequirements: string[]): Promise<Template[]> => {
    let path = _path.join(...this.templatesFolder, 'templates.json');
    return this.fileService.readJson<{ templates: Template[] }>(path).then(data => {
      let templates = data.templates.filter(t => {
        if (missingRequirements.includes(t.name) && t.requires.includes(dependent))
          return t;
      });
      return templates;
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
    let emailPrefix = userEmail.split('@')[0];
    let tmpDir = _path.join(os.tmpdir(), 'shaman', emailPrefix, environment);
    return this.fileService.createFolderRecursive(tmpDir).then(_ => (tmpDir))
  }

}