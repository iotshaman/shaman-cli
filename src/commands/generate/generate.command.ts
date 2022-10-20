import { CommandLineArguments } from "../../command-line-arguments";
import { IValidatorFactory, ValidatorFactory } from "../../factories/validators/validator.factory";
import { Recipe } from '../../models/recipe';
import { ProjectTransformation, Solution, SolutionProject } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { IRecipeService, RecipeService } from "../../services/recipe.service";
import { ICommand } from "../command";
import { InteractiveCommands, Prompt } from "../interactive-commands";
import { ScaffoldCommand } from '../scaffold/scaffold.command';

export class GenerateCommand implements ICommand {
    get name(): string { return "generate"; }
    fileService: IFileService = new FileService();
    recipeService: IRecipeService = new RecipeService();
    scaffoldCommand: ICommand = new ScaffoldCommand();
    interaction: InteractiveCommands = new InteractiveCommands();
    validatorFactory: IValidatorFactory = new ValidatorFactory();

    private solutionName: string;
    private filePath: string;
    private template: string;
    private recipeName: string;

    private addFlag: boolean;
    private fromTemplatesFlag: boolean;

    private validators: { [key: string]: (answer: string) => boolean }

    constructor() {
        this.validators = {
            'environment': this.validatorFactory.buildValidator(RegExp('^[\\w]+$')),
            'path': this.validatorFactory.buildValidator(RegExp('^[\\w-./\\\\]+$')),
            'projectName': this.validatorFactory.buildValidator(RegExp('^[\\w-]+$')),
            'recipe': this.validatorFactory.buildValidator(RegExp('^.*$')),
            'solutionName': this.validatorFactory.buildValidator(RegExp('^(?!\s*$).+$')),
            'templateName': this.validatorFactory.buildValidator(RegExp('^(?!\s*$).+$')),
            'yesOrNo': this.validatorFactory.buildValidator(RegExp('^[yYnN]{1}$'))
        }
    }

    run = (cla: CommandLineArguments): Promise<void> => {
        this.assignArguments(cla);
        if (this.addFlag) return this.addProjectsToShamanFile();
        return this.generateNewShamanFile();
    };

    private addProjectsToShamanFile = (): Promise<void> => {
        let shamanFile: Solution;
        return this.fileService.getShamanFile(this.filePath)
            .then(file => { shamanFile = file })
            .then(_ => {
                if (!!this.template) return this.askProjectDetails(this.template).then(p => [p]);
                return this.constructMultipleProjects();    
            })
            .then(projects => {shamanFile.projects.push(...projects)})
            .then(_ => this.fileService.writeJson(this.filePath, shamanFile))
            .then(_ => this.scaffoldSolution());
    }

    private generateNewShamanFile = (): Promise<void> => {
        return this.fileService.pathExists(this.filePath)
            .then(exists => { if (exists) throw new Error(`shaman.json file already exists at '${this.filePath}'`); })
            .then(_ => {
                if (!this.solutionName) return this.askForSolutionName()
                    .then(name => this.solutionName = name)
            })
            .then(_ => {
                if (this.fromTemplatesFlag) return this.generateFromTemplates();
                return this.generateFromRecipe();
            })
            .then(_ => this.scaffoldSolution())
            .then(_ => console.log("Solution generation is complete."));
    }

    private generateFromRecipe = (): Promise<void> => {
        return this.askForRecipe()
            .then(recipe => { if (!!recipe) this.recipeName = recipe })
            .then(_ => this.recipeService.getRecipe(this.recipeName))
            .then(recipe => this.renameRecipeProjects(recipe))
            .then(updatedRecipe => this.generateShamanFile(updatedRecipe.projects, updatedRecipe.transform))
    }

    private generateFromTemplates = (): Promise<void> => {
        return this.constructMultipleProjects()
            .then(projects => this.generateShamanFile(projects))
    }

    private constructMultipleProjects = (projects?: SolutionProject[]): Promise<SolutionProject[]> => {
        if (!projects) projects = [];
        return this.askForTemplateName()
            .then(templateName => this.askProjectDetails(templateName))
            .then(newProject => projects.push(newProject))
            .then(_ => this.askIfAddingAnotherProject())
            .then(addingAnother => { if (addingAnother) return this.constructMultipleProjects(projects); })
            .then(_ => projects);
    }

    private renameRecipeProjects = (recipe: Recipe): Promise<Recipe> => {
        let prompts = recipe.projects.map(p => {
            return new Prompt(`Rename '${p.name}': `, p.name, this.validators.projectName)
        });
        return this.interaction.interrogate(prompts)
            .then(renameValues => this.updateRecipeProjectNames(recipe, renameValues));
    }

    private updateRecipeProjectNames = (recipe: Recipe, renameValues: { [key: string]: string }): Promise<Recipe> => {
        return new Promise((res) => {
            let recipeJSON = JSON.stringify(recipe);
            Object.entries<string>(renameValues).forEach((e) => {
                let replace = RegExp(e[0], "g");
                recipeJSON = recipeJSON.replace(replace, e[1]);
            });
            res(JSON.parse(recipeJSON));
        })
    }

    private askProjectDetails = (templateName: string): Promise<SolutionProject> => {
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

    private askForTemplateName = (): Promise<string> => {
        let prompt = [new Prompt('What template would you like to use? ', 'template', this.validators.templateName)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['template'])
    }

    private askForSolutionName = (): Promise<string> => {
        let prompt = [new Prompt('What would you like to name your solution? ', 'solutionName', this.validators.solutionName)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['solutionName']);
    }

    private askIfAddingAnotherProject = (): Promise<boolean> => {
        let prompt = [new Prompt('Add another project? (y/n) ', 'addAnother', this.validators.yesOrNo)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['addAnother'] == 'y');
    }

    private askForRecipe = (): Promise<string> => {
        let prompt = [new Prompt('What recipe would you like to use? (press enter for default recipe) ', 'recipe', this.validators.recipe)];
        return this.interaction.interrogate(prompt).then(rslt => rslt['recipe']);
    }

    private generateShamanFile = (projects: SolutionProject[], transformations?: ProjectTransformation[]): Promise<void> => {
        console.log('Generating shaman.json file...');
        let solution: Solution = {
            name: this.solutionName,
            projects: projects,
            transform: !!transformations ? transformations : []
        }
        return this.fileService.writeJson(this.filePath, solution)
            .then(_ => console.log('Generated shaman.json file.'));
    }

    private scaffoldSolution = (): Promise<void> => {
        let scaffoldArguments = new CommandLineArguments(
            ['', '', 'scaffold', `--filePath=${this.filePath}`]
        );
        return this.scaffoldCommand.run(scaffoldArguments);
    }

    assignArguments = (cla: CommandLineArguments) => {
        this.solutionName = cla.getValueOrDefault('name');
        this.filePath = cla.getValueOrDefault('filePath');
        this.template = cla.getValueOrDefault('template');
        this.recipeName = cla.getValueOrDefault('recipe');
        this.addFlag = cla.getFlag('-add');
        this.fromTemplatesFlag = cla.getFlag('-fromTemplates');
    }

}
