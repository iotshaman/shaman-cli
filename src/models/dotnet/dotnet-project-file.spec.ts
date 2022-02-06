import 'mocha';
import { expect } from 'chai';
import { DotnetProjectFile } from'./dotnet-project-file';

describe('Dotnet Project File', () => {
  
  it('toXml should return xml object', () => {
    let subject = new DotnetProjectFile([{Project: []}]);
    let rslt = subject.toXml();
    expect(rslt[0].Project).not.to.be.undefined;
  });
  
  it('addProjectReference should add item group with include statement', () => {
    let subject = new DotnetProjectFile([{Project: []}]);
    let rslt = subject.addProjectReference("sample");
    expect(rslt[0].Project[0].ItemGroup[0][":@"]["@_Include"]).to.equal("sample");
  });
  
  it('addProjectReference should add version to dependency item', () => {
    let subject = new DotnetProjectFile([{Project: []}]);
    let rslt = subject.addProjectReference("sample", "1.0.0");
    expect(rslt[0].Project[0].ItemGroup[0][":@"]["@_Version"]).to.equal("1.0.0");
  });

});