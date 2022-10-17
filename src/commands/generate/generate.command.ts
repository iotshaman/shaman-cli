import { CommandLineArguments } from "../../command-line-arguments";
import { Recipe } from '../../models/recipe';
import { Solution } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { IRecipeService, RecipeService } from "../../services/recipe.service";
import { ICommand } from "../command";
import { InteractiveCommands, Prompt } from "../interactive-commands";
// import { ISubject } from "../interactive-commands";
import { ScaffoldCommand } from '../scaffold/scaffold.command';

// export interface IObserver {
//     update(subject: ISubject): void;
// }

export class GenerateCommand implements ICommand {
    get name(): string { return "generate"; }
    fileService: IFileService = new FileService();
    recipeService: IRecipeService = new RecipeService();
    scaffoldCommand: ICommand = new ScaffoldCommand();

    private solutionName: string;
    private filePath: string;
    private project: string;
    private recipeName: string;

    // private testRenames: {} = {};

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
        return Promise.reject(new Error('addProjectsToShamanFile() not implemented'));
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

    // update = (subject: InteractiveCommands) => {
    //     this.testRenames = subject.state;
    // }

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
        let prompts = this.createPrompts(recipe);
        let interactiveCommand = new InteractiveCommands(prompts);
        return interactiveCommand.interogate()
            .then(renameValues => this.updateRecipeProjectNames(recipe, renameValues));
    }

    private createPrompts = (recipe: Recipe): Prompt[] => {
        let prompts: Prompt[] = recipe.projects.map(p => {
            return new Prompt(`Rename '$': `, p.name, this.validator);
        });
        return prompts;
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

    private validator = (answer: string): boolean => {
        let regex = RegExp('^[\\w-]+$');
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
