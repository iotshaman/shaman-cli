import * as _path from 'path';
import { Template } from "../models/template";
import { FileService, IFileService } from './file.service';

export interface ITemplateService {
  getTemplate: (environment: string, projectType: string) => Promise<Template>;
  unzipProjectTemplate: (template: Template, folderPath: string) => Promise<void>;
}

export class TemplateService implements ITemplateService {
  
  fileService: IFileService = new FileService();
  templatesFolder: string[] = [__dirname, '..', '..', 'templates'];

  getTemplate = (environment: string, projectType: string): Promise<Template> => {
    let path = _path.join(...this.templatesFolder, 'templates.json');
    return this.fileService.readJson<{templates: Template[]}>(path).then(data => {
      let template = data.templates.find(t => t.environment == environment && t.type == projectType);
      if (!template) throw new Error(`Project type not found: ${environment}-${projectType}`);
      return template;
    });
  }

  unzipProjectTemplate = (template: Template, folderPath: string): Promise<void> => {
    let templatePath = _path.join(...this.templatesFolder, template.file);
    return this.fileService.unzipFile(templatePath, folderPath);
  }

}