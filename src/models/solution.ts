export class Solution {
  projects: SolutionProject[];
}

export class SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;
}