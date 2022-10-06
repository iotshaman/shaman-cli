import { CommandLineArguments } from "../../command-line-arguments";
import { Recipe } from '../../models/recipe';
import { Solution } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { IRecipeService, RecipeService } from "../../services/recipe.service";
import { ICommand } from "../command";
import { ScaffoldCommand } from '../scaffold/scaffold.command';

export class GenerateCommand implements ICommand {
    get name(): string { return "generate"; }
    fileService: IFileService = new FileService();
    recipeService: IRecipeService = new RecipeService();
    scaffoldCommand: ICommand = new ScaffoldCommand();

    private solutionName: string;
    private filePath: string;
    private recipeName: string;

    run = (cla: CommandLineArguments): Promise<void> => {
        this.assignArguments(cla);
        if (!this.solutionName) return Promise.reject(new Error('Name argument not provided to generate command.'));
        return this.fileService.pathExists(this.filePath)
            .then(exists => { if (exists) throw new Error(`shaman.json file already exists at '${this.filePath}'`); })
            .then(_ => this.recipeService.getRecipe(this.recipeName))
            .then(recipe => this.generateShamanFile(recipe))
            .then(_ => this.scaffoldSolution());
    };

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

    private scaffoldSolution = (): Promise<void> => {
        let scaffoldArguments = new CommandLineArguments(
            ['', '', 'scaffold', `--filePath=${this.filePath}`]
        );        
        return this.scaffoldCommand.run(scaffoldArguments);
    }

    assignArguments = (cla: CommandLineArguments) => {
        this.solutionName = cla.getValueOrDefault('name');
        this.filePath = cla.getValueOrDefault('filePath');
        this.recipeName = cla.getValueOrDefault('recipe');
    }

}
