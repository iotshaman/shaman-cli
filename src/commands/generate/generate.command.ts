import { CommandLineArguments } from "../../command-line-arguments";
import { Recipe } from '../../models/recipe';
import { Solution } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { IRecipeService, RecipeService } from "../../services/recipe.service";
import { ICommand } from "../command";
import { ScaffoldCommand } from '../scaffold/scaffold.command';

export class GenerateCommand implements ICommand {
    get name(): string { return "generate"; }
    private fileService: IFileService = new FileService();
    private recipeService: IRecipeService = new RecipeService();

    // shaman generate --name=NAME [--filePath=FILEPATH] [--recipe=RECIPE]
    private solutionName: string;
    private filePath: string;
    private recipeName: string;

    run = (cla: CommandLineArguments): Promise<void> => {
        this.assignArguments(cla);
        if (!this.solutionName) return Promise.reject(new Error('Name argument not provided to generate command.'));
        return this.fileService.pathExists(this.filePath)
            .then(exists => { if (exists) throw new Error(`shaman.json file already exists at '${this.filePath}`); })
            .then(_ => this.recipeService.getRecipe(this.recipeName))
            .then(recipe => this.createShamanFile(recipe))
            .then(_ => this.scaffoldSolution());
    };

    private createShamanFile = (recipe: Recipe): Promise<void> => {
        console.log('Creating shaman.json file...');
        let solution: Solution = {
            name: this.solutionName,
            projects: recipe.projects,
            transform: recipe.transform
        }
        return this.fileService.writeJson(this.filePath, solution)
            .then(_ => console.log('Created shaman.json file.'));
    }

    private scaffoldSolution = (): Promise<void> => {
        let scaffoldArguments = new CommandLineArguments(
            ['', '', 'scaffold', `--filePath=${this.filePath}`]
        );
        let scaffoldCommand = new ScaffoldCommand();
        return scaffoldCommand.run(scaffoldArguments);
    }

    assignArguments = (cla: CommandLineArguments) => {
        this.solutionName = cla.getValueOrDefault('name');
        this.filePath = cla.getValueOrDefault('filePath');
        this.recipeName = cla.getValueOrDefault('recipe');
    }

}
