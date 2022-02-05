import { SolutionProject } from "../models/solution";

export class DependencyTree {

  root: DependencyNode[] = [];
  map: ProjectDependencyMap;

  constructor(projects: SolutionProject[], dependencyProperty: string = 'include') {
    this.map = projects.reduce((a, b) => {
      a[b.name] = !b[dependencyProperty] ? [] : b[dependencyProperty];
      return a;
    }, {});
    this.build(projects, dependencyProperty);
  }

  private build = (projects: SolutionProject[], dependencyProperty: string) => {
    projects.forEach(project => {
      let node = new DependencyNode(project.name);
      if (!!project[dependencyProperty]?.length) {
        project[dependencyProperty].forEach(i => node.addDependent(i, this.map));
      }
      this.root.push(node);      
    })
  }

  getOrderedProjectList = (): string[] => {
    let dependencies: string[] = [];
    let nodes = this.root.map(n => n);
    while (nodes.length > 0) {
      let nextNodeDepth: DependencyNode[] = [];
      nodes.forEach(node => {
        dependencies.push(node.name);
        node.dependents.forEach(d => {
          if (nextNodeDepth.find(bd => bd.name == d.name)) return;
          nextNodeDepth.push(d)
        });
      });
      nodes = nextNodeDepth;
    }
    return dependencies.reverse().reduce((a, b) => {
      if (!a.includes(b)) a.push(b);
      return a;
    }, []);
  }

  //TODO: merge getOrderedProjectListFromNode into getOrderedProjectList (with optional parameter)
  getOrderedProjectListFromNode = (project: string): string[] => {
    let dependencies: string[] = [];
    let nodes = [this.root.find(p => p.name == project)];
    while (nodes.length > 0) {
      let nextNodeDepth: DependencyNode[] = [];
      nodes.forEach(node => {
        dependencies.push(node.name);
        node.dependents.forEach(d => nextNodeDepth.push(d));
      });
      nodes = nextNodeDepth;
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