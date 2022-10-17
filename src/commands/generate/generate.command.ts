import { CommandLineArguments } from "../../command-line-arguments";
import { Recipe } from '../../models/recipe';
import { Solution, SolutionProject } from "../../models/solution";
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

    private solutionName: string;
    private filePath: string;
    private project: string;
    private recipeName: string;

    run = (cla: CommandLineArguments): Promise<void> => {
        this.assignArguments(cla);
        if (!!this.project && !!this.solutionName) return this.generateFromProjects();
        if (!!this.project) return this.addProjectsToShamanFile();
        return this.generateFromRecipe();
    };

    private generateFromProjects = (): Promise<void> => {
        // TODO: not implemented
        console.log('generateFromProjects()');
        return Promise.reject(new Error('generateFromProjects() not implemented'));
    }

    private addProjectsToShamanFile = (): Promise<void> => {
        console.log('addProjectsToShamanFile()');
        let shamanFile: Solution;
        return this.fileService.getShamanFile(this.filePath)
            .then(shaman => shamanFile = shaman)
            .then(_ => {
                let prompts = [
                    new Prompt(`Name for '${this.project}': `, `${this.project}Name`, this.nameValidator),
                    new Prompt(`Environment for '${this.project}': `, `${this.project}Environment`, this.nameValidator),
                    new Prompt(`File path for '${this.project}': `, `${this.project}Path`, this.pathValidator)
                ];
                let interactiveCommand = new InteractiveCommands(prompts); 
                return interactiveCommand.interogate();
            })
            .then(rslt => {
                let pName = rslt[`${this.project}Name`];
                let pEnvironment = rslt[`${this.project}Environment`];
                let pPath = rslt[`${this.project}Path`];
                let newProject: SolutionProject = {
                    name: pName,
                    environment: pEnvironment,
                    type: this.project,
                    path: pPath
                }
                shamanFile.projects.push(newProject)
            })
            .then(_ => this.fileService.writeJson(this.filePath, shamanFile))
            .then(_ => this.scaffoldSolution());
    }

    private generateFromRecipe = (): Promise<void> => {
        if (!this.solutionName) return Promise.reject(new Error('Name argument not provided to generate command.'));
        return this.fileService.pathExists(this.filePath)
            .then(exists => { if (exists) throw new Error(`shaman.json file already exists at '${this.filePath}'`); })
            .then(_ => this.recipeService.getRecipe(this.recipeName))
            .then(recipe => this.renameProjects(recipe))
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

    private renameProjects = (recipe: Recipe): Promise<Recipe> => {
        let prompts = recipe.projects.map(p => {
            return new Prompt(`Rename '${p.name}': `, p.name, this.nameValidator)
        });
        let interactiveCommand = new InteractiveCommands(prompts);
        return interactiveCommand.interogate()
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

    private nameValidator = (answer: string): boolean => {
        let regex = RegExp('^[\\w-]+$');
        return regex.test(answer);
    }

    private pathValidator = (answer: string): boolean => {
        let regex = RegExp('^[\\w-./\\\\]+$');
        return regex.test(answer);
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
    }

}
