import 'mocha';
import { expect } from 'chai';
import { DependencyTree } from './dependency-tree';

describe('Dependency Node', () => {
  
  it('map should be populated', () => {
    let subject = new DependencyTree({projects: [
      {name: 'test', environment: 'node', type: 'library', path: './test'}
    ]});
    expect(subject.map).not.to.be.undefined;
  });
  
  it('root should be populated', () => {
    let subject = new DependencyTree({projects: [
      {name: 'db', environment: 'node', type: 'database', path: './db'},
      {name: 'test', environment: 'node', type: 'library', path: './test', include: ['db']}
    ]});
    expect(subject.root.length).to.equal(2);
  });
  
  it('test project should have sub-dependency', () => {
    let subject = new DependencyTree({projects: [
      {name: 'db', environment: 'node', type: 'database', path: './db'},
      {name: 'test', environment: 'node', type: 'library', path: './test', include: ['db']}
    ]});
    expect(subject.root.find(n => n.name == "test").dependents.length).to.equal(1);
  });

  it('ctor should throw if circular dependency found', () => {
    try {
      new DependencyTree({projects: [
        {name: 'lib', environment: 'node', type: 'library', path: './db', include: ['test']},
        {name: 'test', environment: 'node', type: 'server', path: './test', include: ['lib']}
      ]});  
    } catch(ex) {
      expect(ex.message).to.equal("Circular dependency found: lib -> test -> lib.");
    }
  });

  it('ctor should throw if invalid dependency found', () => {
    try {
      new DependencyTree({projects: [
        {name: 'test', environment: 'node', type: 'server', path: './test', include: ['lib']}
      ]});  
    } catch(ex) {
      expect(ex.message).to.equal("Invalid dependency 'lib'");
    }
  });
  
  it('getOrderedProjectList should return correct ordering of dependencies', () => {
    let subject = new DependencyTree({projects: [
      {name: 'db', environment: 'node', type: 'database', path: './db'},
      {name: 'lib', environment: 'node', type: 'library', path: './db', include: ['db']},
      {name: 'test', environment: 'node', type: 'server', path: './test', include: ['db', 'lib']}
    ]});
    expect(subject.getOrderedProjectList().join(',')).to.equal(['db', 'lib', 'test'].join(','));
  });

});