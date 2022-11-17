export class Solution {
  name: string;
  projects: SolutionProject[];
  transform?: ProjectTransformation[];
  auth?: TemplateAuthorization;
}

export class SolutionProject {
  name: string;
  environment: string;
  template: string;
  path: string;
  custom?: boolean;
  language?: string;
  include?: string[];
  specs?: {[spec: string]: any};
  runtimeDependencies?: string[];
}

export class ProjectTransformation {
  targetProject: string;
  transformation: string;
  sourceProject?: string;
  specs?: {[spec: string]: any};
}

export class TemplateAuthorization {
  email: string;
  token: string;
}