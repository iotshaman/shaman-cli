import { buildValidator } from "../../factories/validators/validator.factory";
import { Recipe } from "../../models/recipe";
import { SolutionProject } from "../../models/solution";
import { InteractiveCommands, Prompt } from "../interactive-commands";

export interface IGenerateCommandPrompts {
    askProjectDetails: (templateName: string) => Promise<SolutionProject>;
    askToRenameRecipeProjects: (recipe: Recipe) => Promise<Recipe>;
    askForTemplateName: () => Promise<string>;
    askForSolutionName: () => Promise<string>;
    askIfAddingAnotherProject: () => Promise<boolean>;
    askForRecipe: () => Promise<string>;
    askForGenerationMethod: () => Promise<string>;
}

export class GenerateCommandPrompts implements IGenerateCommandPrompts {
    interaction: InteractiveCommands = new InteractiveCommands();
    private validators: { [key: string]: (answer: string) => boolean }

    constructor() {
        this.validators = {
            'environment': buildValidator(RegExp('^[\\w]+$')),
            'path': buildValidator(RegExp('^[\\w-./\\\\]+$')),
            'projectName': buildValidator(RegExp('^[\\w-]+$')),
            'recipe': buildValidator(RegExp('^.*$')),
            'solutionName': buildValidator(RegExp('^(?!\s*$).+$')),
            'templateName': buildValidator(RegExp('^(?!\s*$).+$')),
            'yesOrNo': buildValidator(RegExp('^[yYnN]{1}$')),
            'templateOrRecipe': buildValidator(RegExp('^[tTrR]{1}$'))
        }
    }

    public askProjectDetails = (templateName: string): Promise<SolutionProject> => {
        let nameKey = `${templateName}Name`, environmentKey = `${templateName}Environment`, pathKey = `${templateName}Path`;
        let prompts = [
            new Prompt(`What environment does '${templateName}' belong to? `, environmentKey, this.validators.environment),
            new Prompt(`What would you like to name this project? `, nameKey, this.validators.templateName),
            new Prompt(`What file path would you like to use for this project? `, pathKey, this.validators.path)
        ];
        return this.interaction.interrogate(prompts).then(rslt => {
            let newProject: SolutionProject = {
                name: rslt[nameKey],
                environment: rslt[environmentKey],
                type: templateName,
                path: rslt[pathKey]
            }
            return newProject;
        });
    }

    public askToRenameRecipeProjects = (recipe: Recipe): Promise<Recipe> => {
        let prompts = recipe.projects.map(p => {
            return new Prompt(`Rename '${p.name}': `, p.name, this.validators.projectName)
        });
        return this.interaction.interrogate(prompts)
            .then(renameValues => {
                return new Promise((res) => {
                    let recipeJSON = JSON.stringify(recipe);
                    Object.entries<string>(renameValues).forEach((e) => {
                        let replace = RegExp(e[0], "g");
                        recipeJSON = recipeJSON.replace(replace, e[1]);
                    });
                    res(JSON.parse(recipeJSON));
                })
            });
    }

    public askForTemplateName = (): Promise<string> => {
        let prompt = [new Prompt('What template would you like to use? ', 'template', this.validators.templateName)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['template'])
    }

    public askForSolutionName = (): Promise<string> => {
        let prompt = [new Prompt('What would you like to name your solution? ', 'solutionName', this.validators.solutionName)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['solutionName']);
    }

    public askIfAddingAnotherProject = (): Promise<boolean> => {
        let prompt = [new Prompt('Add another project? (y/n) ', 'addAnother', this.validators.yesOrNo)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['addAnother'] == 'y');
    }

    public askForRecipe = (): Promise<string> => {
        let prompt = [new Prompt('What recipe would you like to use? (press enter for default recipe) ', 'recipe', this.validators.recipe)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['recipe']);
    }

    askForGenerationMethod = (): Promise<string> => {
        let prompt = [new Prompt('Would you like to generate from a recipe or templates? (r/t) ', 'choice', this.validators.templateOrRecipe)];
        return this.interaction.interrogate(prompt).then(rslt => {
            if (rslt['choice'] == 'r') return 'recipe';
            return 'template'
        });
    };

}
