import { Solution } from "../models/solution";
import { CsharpComposeDataContextTransformation } from "../transformations/dotnet/csharp-compose-datacontext.transform";
import { NodeComposeDataContextTransformation } from "../transformations/node/node-compose-datacontext.transform";
import { ITransformation } from "../transformations/transformation";

export interface ITransformationService {
  performTransformations: (solution: Solution, solutionFilePath: string, newProjects: string[]) => Promise<void>;
}

export class TransformationService implements ITransformationService {

  /* istanbul ignore next */
  transformations: ITransformation[] = [
    new NodeComposeDataContextTransformation(),
    new CsharpComposeDataContextTransformation()
  ]

  performTransformations = (solution: Solution, solutionFilePath: string, newProjects: string[]): Promise<void> => {
    if (!solution.transform?.length) return Promise.resolve();
    // const newTransformations = solution.transform.filter(t => newProjects.includes(t.targetProject));
    // if (!newTransformations.length) return Promise.resolve();
    const transformationTaskChain = solution.transform.reduce((a, b) => a.then(_ => {
      let targetProject = solution.projects.find(p => p.name == b.targetProject);
      if (!targetProject) throw new Error(`Invalid target project in transformation: ${b.transformation} -> ${b.targetProject}`);
      if (!!b.sourceProject) {
        let sourceProject = solution.projects.find(p => p.name == b.sourceProject);
        if (!sourceProject) throw new Error(`Invalid source project in transformation: ${b.transformation} -> ${b.sourceProject}`);
      }
      const transformations = !targetProject.language ? this.transformations : 
        this.transformations.filter(t => t.language == targetProject.language);
      let transformation = transformations.find(
        t => t.name == b.transformation && t.environment == targetProject.environment
      );
      if (!transformation) throw new Error(`Invalid transformation: ${b.transformation} (${targetProject.environment}).`);
      if (!newProjects.includes(b.targetProject)) return Promise.resolve();
      console.log(`Performing transformation '${b.transformation}' on project '${b.targetProject}'.`);
      return transformation.transform(b, solution, solutionFilePath.replace('shaman.json', ''));
    }), Promise.resolve());
    return transformationTaskChain.then(_ => console.log("All transformations have been applied."));
  }

}

