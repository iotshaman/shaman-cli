export class Solution {
  name: string;
  projects: SolutionProject[];
  transform?: ProjectTransformation[];
}

export class SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;
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