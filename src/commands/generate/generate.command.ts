import { CommandLineArguments } from "../../command-line-arguments";
import { Recipe } from '../../models/recipe';
import { Solution, SolutionProject } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { IRecipeService, RecipeService } from "../../services/recipe.service";
import { IValidatorService, ValidatorService } from "../../services/validator.service";
import { ICommand } from "../command";
import { InteractiveCommands, Prompt } from "../interactive-commands";
import { ScaffoldCommand } from '../scaffold/scaffold.command';

export class GenerateCommand implements ICommand {
    get name(): string { return "generate"; }
    fileService: IFileService = new FileService();
    recipeService: IRecipeService = new RecipeService();
    validatorService: IValidatorService = new ValidatorService();
    scaffoldCommand: ICommand = new ScaffoldCommand();
    interaction: InteractiveCommands = new InteractiveCommands();

    private solutionName: string;
    private filePath: string;
    private project: string;
    private recipeName: string;
    private addFlag: boolean;

    run = (cla: CommandLineArguments): Promise<void> => {
        this.assignArguments(cla);
        if (this.addFlag) return this.addProjectsToShamanFile();
        return this.generateNewShamanFile();
    };

    private addProjectsToShamanFile = (): Promise<void> => {
        return this.fileService.getShamanFile(this.filePath)
            .then(shamanFile => {
                if (!!this.project) return this.addSingleProject(this.project, shamanFile);
                else return this.addMultipleProjects(shamanFile);
            })
            .then(newShamanFile => this.fileService.writeJson(this.filePath, newShamanFile))
            .then(_ => this.scaffoldSolution());
    }

    private addSingleProject = (templateName: string, shamanFile: Solution): Promise<Solution> => {
        return this.constructNewProject(templateName)
            .then(newProject => {
                shamanFile.projects.push(newProject);
                return shamanFile;
            });
    }

    private addMultipleProjects = (shamanFile: Solution): Promise<Solution> => {
        return this.getTemplateName()
            .then(templateName => this.constructNewProject(templateName))
            .then(newProject => shamanFile.projects.push(newProject))
            .then(_ => this.askIfAddingAnotherProject())
            .then(addingAnotherProject => {
                if (addingAnotherProject) return this.addMultipleProjects(shamanFile);
                else return shamanFile;
            });
    }

    private getTemplateName = (): Promise<string> => {
        let templateKey = 'template';
        let prompt = [new Prompt('Name of template to add: ', templateKey, this.validatorService.templateNameValidator)];
        return this.interaction.interogate(prompt).then(rslt => rslt[templateKey])
    }

    private constructNewProject = (templateName: string): Promise<SolutionProject> => {
        let nameKey = `${templateName}Name`, environmentKey = `${templateName}Environment`, pathKey = `${templateName}Path`;
        let prompts = [
            new Prompt(`Project name for '${templateName}': `, nameKey, this.validatorService.templateNameValidator),
            new Prompt(`Environment of '${templateName}': `, environmentKey, this.validatorService.environmentValidator),
            new Prompt(`File path for '${templateName}': `, pathKey, this.validatorService.pathValidator)
        ];
        return this.interaction.interogate(prompts).then(rslt => {
            let newProject: SolutionProject = {
                name: rslt[nameKey],
                environment: rslt[environmentKey],
                type: templateName,
                path: rslt[pathKey]
            }
            return newProject;
        });
    }

    private askIfAddingAnotherProject = (): Promise<boolean> => {
        let continueKey = 'continue';
        let prompt = [new Prompt('Add another project (y/n): ', continueKey, this.validatorService.yesNoValidator)];
        return this.interaction.interogate(prompt)
            .then(rslt => rslt[continueKey] == 'y');
    }

    private generateNewShamanFile = (): Promise<void> => {
        if (!this.solutionName) return Promise.reject(new Error('Name argument not provided to generate command.'));
        return this.fileService.pathExists(this.filePath)
            .then(exists => { if (exists) throw new Error(`shaman.json file already exists at '${this.filePath}'`); })
            .then(_ => this.recipeService.getRecipe(this.recipeName))
            .then(recipe => this.renameRecipeProjects(recipe))
            .then(updatedRecipe => this.generateShamanFile(updatedRecipe))
            .then(_ => this.scaffoldSolution())
            .then(_ => console.log("Solution generation is complete."));
    }

    private generateShamanFile = (recipe: Recipe): Promise<void> => {
        console.log('Generating shaman.json file...');
        let solution: Solution = {
            name: this.solutionName,
            projects: recipe.projects,
            transform: recipe.transform
        }
        return this.fileService.writeJson(this.filePath, solution)
            .then(_ => console.log('Generated shaman.json file.'));
    }

    private renameRecipeProjects = (recipe: Recipe): Promise<Recipe> => {
        let prompts = recipe.projects.map(p => {
            return new Prompt(`Rename '${p.name}': `, p.name, this.validatorService.projectNameValidator)
        });
        return this.interaction.interogate(prompts)
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

    private scaffoldSolution = (): Promise<void> => {
        let scaffoldArguments = new CommandLineArguments(
            ['', '', 'scaffold', `--filePath=${this.filePath}`]
        );
        return this.scaffoldCommand.run(scaffoldArguments);
    }

    assignArguments = (cla: CommandLineArguments) => {
        this.solutionName = cla.getValueOrDefault('name');
        this.filePath = cla.getValueOrDefault('filePath');
        this.project = cla.getValueOrDefault('project');
        this.recipeName = cla.getValueOrDefault('recipe');
        this.addFlag = cla.flags['--add'];
    }

}
