export class DotnetProjectFile {

  constructor(private xml: any) {

  }

  toXml = (): any => {
    return Object.assign({}, this.xml);
  }

  addProjectReference = (projectFilePath: string, version?: string): any => {
    let itemGroup = {
      ItemGroup: [
        {
          ':@': { '@_Include': projectFilePath },
          ProjectReference: []
        }
      ]
    };
    if (!!version) itemGroup.ItemGroup[0][':@'][`@_Version`] = version;
    this.xml[0].Project.push(itemGroup);
    return this.toXml();
  }

}