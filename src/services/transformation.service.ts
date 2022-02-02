import { Solution } from "../models/solution";
import { NodeComposeDataContextTransformation } from "../transformations/node/node-compose-datacontext.transform";
import { ITransformation } from "../transformations/transformation";

export interface ITransformationService {
  performTransformations: (solution: Solution, solutionFilePath: string) => Promise<void>;
}

export class TransformationService implements ITransformationService {

  /* istanbul ignore next */
  transformations: ITransformation[] = [
    new NodeComposeDataContextTransformation()
  ]

  performTransformations = (solution: Solution, solutionFilePath: string): Promise<void> => {
    if (!solution.transform?.length) return Promise.resolve();
    return solution.transform.reduce((a, b) => a.then(_ => {
      let targetProject = solution.projects.find(p => p.name == b.targetProject);
      if (!targetProject) throw new Error(`Invalid target project in transformation: ${b.transformation} -> ${b.targetProject}`);
      if (!!b.sourceProject) {
        let sourceProject = solution.projects.find(p => p.name == b.sourceProject);
        if (!sourceProject) throw new Error(`Invalid source project in transformation: ${b.transformation} -> ${b.sourceProject}`);
      }
      let transformation = this.transformations.find(
        t => t.name == b.transformation && t.environment == targetProject.environment
      );
      if (!transformation) throw new Error(`Invalid transformation: ${b.transformation} (${targetProject.environment}).`);
      return transformation.transform(b, solution, solutionFilePath.replace('shaman.json', ''));
    }), Promise.resolve());
  }

}
