import { Solution, SolutionProject } from "../models/solution";

export class DependencyTree {

  root: DependencyNode[] = [];
  map: ProjectDependencyMap;

  constructor(solution: Solution) {
    this.map = solution.projects.reduce((a, b) => {
      a[b.name] = !b.include ? [] : b.include;
      return a;
    }, {});
    this.build(solution.projects);
  }

  private build = (projects: SolutionProject[]) => {
    projects.forEach(project => {
      let node = new DependencyNode(project.name);
      if (!!project.include?.length) {
        project.include.forEach(i => node.addDependent(i, this.map));
      }
      this.root.push(node);      
    })
  }

  getOrderedProjectList = (): string[] => {
    let depth: number = 0;
    let dependencies: string[] = [];
    let batch = this.root.map(n => n);
    while (batch.length > 0) {
      let newBatch: DependencyNode[] = [];
      batch.forEach(b => {
        dependencies.push(b.name);
        b.dependents.forEach(d => {
          if (newBatch.find(bd => bd.name == d.name)) return;
          newBatch.push(d)
        });
      });
      depth++;
      batch = newBatch;
    }
    return dependencies.reverse().reduce((a, b) => {
      if (!a.includes(b)) a.push(b);
      return a;
    }, []);
  }

}

class DependencyNode {

  name: string;
  dependents: DependencyNode[] = [];
  path: string[] = [];

  constructor(name: string, path: string[] = [], parent: string = null) {
    this.name = name;
    this.path = path;
    if (!!parent) {
      let fullPath = [...path, parent].join(' -> ');
      if (path.includes(parent)) throw new Error(`Circular dependency found: ${fullPath}.`);
      this.path.push(parent);
    }
  }

  addDependent = (name: string, map: ProjectDependencyMap) => {
    let node = new DependencyNode(name, [...this.path], this.name);
    let dependents = map[name];
    if (!dependents) throw new Error(`Invalid dependency '${name}'`);
    dependents.forEach(dependent => node.addDependent(dependent, map));
    this.dependents.push(node);
  }

}

class ProjectDependencyMap {
  [project: string]: string[];
}