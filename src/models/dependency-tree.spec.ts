import 'mocha';
import { expect } from 'chai';
import { DependencyTree } from './dependency-tree';

describe('Dependency Node', () => {
  
  it('map should be populated', () => {
    let subject = new DependencyTree([
      {name: 'test', environment: 'node', template: 'library', path: './test'}
    ]);
    expect(subject.map).not.to.be.undefined;
  });
  
  it('root should be populated', () => {
    let subject = new DependencyTree([
      {name: 'db', environment: 'node', template: 'database', path: './db'},
      {name: 'test', environment: 'node', template: 'library', path: './test', include: ['db']}
    ]);
    expect(subject.root.length).to.equal(2);
  });
  
  it('test project should have sub-dependency', () => {
    let subject = new DependencyTree([
      {name: 'db', environment: 'node', template: 'database', path: './db'},
      {name: 'test', environment: 'node', template: 'library', path: './test', include: ['db']}
    ]);
    expect(subject.root.find(n => n.name == "test").dependents.length).to.equal(1);
  });

  it('ctor should throw if circular dependency found', () => {
    try {
      new DependencyTree([
        {name: 'lib', environment: 'node', template: 'library', path: './db', include: ['test']},
        {name: 'test', environment: 'node', template: 'server', path: './test', include: ['lib']}
      ]);  
    } catch(ex) {
      expect(ex.message).to.equal("Circular dependency found: lib -> test -> lib.");
    }
  });

  it('ctor should throw if invalid dependency found', () => {
    try {
      new DependencyTree([
        {name: 'test', environment: 'node', template: 'server', path: './test', include: ['lib']}
      ]);  
    } catch(ex) {
      expect(ex.message).to.equal("Invalid dependency 'lib'");
    }
  });
  
  it('getOrderedProjectList should return correct ordering of dependencies', () => {
    let subject = new DependencyTree([
      {name: 'db', environment: 'node', template: 'database', path: './db'},
      {name: 'lib', environment: 'node', template: 'library', path: './db', include: ['db']},
      {name: 'test', environment: 'node', template: 'server', path: './test', include: ['db', 'lib']}
    ]);
    expect(subject.getOrderedProjectList().join(',')).to.equal(['db', 'lib', 'test'].join(','));
  });
  
  it('getOrderedProjectListFromNode should return correct ordering of dependencies', () => {
    let subject = new DependencyTree([
      {name: 'db', environment: 'node', template: 'database', path: './db'},
      {name: 'lib1', environment: 'node', template: 'library', path: './lib1'},
      {name: 'lib2', environment: 'node', template: 'library', path: './lib2', include: ['lib1']},
      {name: 'test', environment: 'node', template: 'server', path: './test', include: ['lib2', 'lib1']}
    ]);
    let result = subject.getOrderedProjectListFromNode("test");
    expect(result.join(',')).to.equal(['lib1', 'lib2', 'test'].join(','));
  });

});