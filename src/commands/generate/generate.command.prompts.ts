import { buildValidator } from "../../factories/validators/validator.factory";
import { Recipe } from "../../models/recipe";
import { SolutionProject } from "../../models/solution";
import { InteractiveCommands, Prompt } from "../interactive-commands";

export interface IGenerateCommandPrompts {
    askForProjectDetails: (templateName: string) => Promise<SolutionProject>;
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

    askForProjectDetails = (templateName: string): Promise<SolutionProject> => {
        let prompts = [
            new Prompt(`What environment does '${templateName}' belong to? `, 'environment', this.validators.environment),
            new Prompt(`What would you like to name this project? `, 'name', this.validators.templateName),
            new Prompt(`What file path would you like to use for this project? `, 'path', this.validators.path)
        ];
        return this.interaction.interrogate(prompts).then(rslt => {
            let newProject: SolutionProject = {
                name: rslt['name'],
                environment: rslt['environment'],
                type: templateName,
                path: rslt['path']
            }
            return newProject;
        });
    }

    askToRenameRecipeProjects = (recipe: Recipe): Promise<Recipe> => {
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

    askForTemplateName = (): Promise<string> => {
        let prompt = [new Prompt('What template would you like to use? ', 'template', this.validators.templateName)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['template'])
    }

    askForSolutionName = (): Promise<string> => {
        let prompt = [new Prompt('What would you like to name your solution? ', 'solution', this.validators.solutionName)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['solution']);
    }

    askIfAddingAnotherProject = (): Promise<boolean> => {
        let prompt = [new Prompt('Add another project? (y/n) ', 'addAnother', this.validators.yesOrNo)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['addAnother'] == 'y');
    }

    askForRecipe = (): Promise<string> => {
        let prompt = [new Prompt('What recipe would you like to use? (press enter for default recipe) ', 'recipe', this.validators.recipe)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['recipe']);
    }

    askForGenerationMethod = (): Promise<string> => {
        let prompt = [new Prompt('Would you like to generate from a recipe or templates? (r/t) ', 'method', this.validators.templateOrRecipe)];
        return this.interaction.interrogate(prompt).then(rslt => {
            if (rslt['method'] == 'r') return 'recipe';
            return 'template'
        });
    };

}
