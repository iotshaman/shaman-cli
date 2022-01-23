import { Solution, SolutionProject } from "../models/solution";
import { ITransformation } from "../transformations/transformation";

export interface ITransformationService {
  performTransformations: (project: SolutionProject, cwd: string, solution: Solution) => Promise<void>;
}

export class TransformationService implements ITransformationService {

  /* istanbul ignore next */
  private transformations: ITransformation[] = [

  ]

  performTransformations = (project: SolutionProject, cwd: string, solution: Solution): Promise<void> => {
    let projectTransformations = solution.transform?.filter(t => t.targetProject == project.name);
    if (!projectTransformations?.length) return Promise.resolve();
    let invalidTransformations = this.transformations.filter(t => 
      !projectTransformations.some(pt => pt.transformation == t.name)
    );
    if (!!invalidTransformations.length) {
      let message = `Invalid transformation(s): ${invalidTransformations.map(t => t.name).join(', ')}`;
      return Promise.reject(new Error(message));
    }
    let transformations = projectTransformations.map(pt => ({
      projectTransformation: pt,
      transformation: this.transformations.find(t => t.name == pt.transformation)
    }));
    return transformations.reduce((a, b) =>
      a.then(_ => b.transformation.transform(b.projectTransformation, solution, cwd)),
      Promise.resolve()
    );
  }

}