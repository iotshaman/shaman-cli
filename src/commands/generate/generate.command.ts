import { CommandLineArguments } from "../../command-line-arguments";
import { Recipe } from '../../models/recipe';
import { Solution } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { IRecipeService, RecipeService } from "../../services/recipe.service";
import { ICommand } from "../command";
import { InteractiveCommands, ISubject, Prompt } from "../interactive-commands";
import { ScaffoldCommand } from '../scaffold/scaffold.command';

export interface IObserver {
    update(subject: ISubject): void;
}

export class GenerateCommand implements ICommand, IObserver {
    get name(): string { return "generate"; }
    fileService: IFileService = new FileService();
    recipeService: IRecipeService = new RecipeService();
    scaffoldCommand: ICommand = new ScaffoldCommand();

    private solutionName: string;
    private filePath: string;
    private project: string;
    private recipeName: string;

    private testRenames: string[] = []

    run = (cla: CommandLineArguments): Promise<void> => {
        this.assignArguments(cla);
        if (!!this.project) return this.addProjectToShamanFile();
        if (!this.solutionName) return Promise.reject(new Error('Name argument not provided to generate command.'));
        return this.fileService.pathExists(this.filePath)
            .then(exists => { if (exists) throw new Error(`shaman.json file already exists at '${this.filePath}'`); })
            .then(_ => this.recipeService.getRecipe(this.recipeName))
            .then(recipe => this.generateShamanFile(recipe))
            .then(_ => this.scaffoldSolution());
    };

    update = (subject: InteractiveCommands) => {
        this.testRenames.push(subject.state);
        console.log(`testRenames: ${this.testRenames}`);
    }

    private generateShamanFile = (recipe: Recipe): Promise<void> => {
        console.log('Generating shaman.json file...');
        let prompts = this.createPrompts(recipe);
        return this.renameProjects(recipe, prompts)
            .then(updatedRecipe => {
                let solution: Solution = {
                    name: this.solutionName,
                    projects: updatedRecipe.projects,
                    transform: updatedRecipe.transform
                }
                return solution;
            })
            .then(solution => this.fileService.writeJson(this.filePath, solution))
            .then(_ => {return console.log('Generated shaman.json file.')});
    }

    private renameProjects = (recipe: Recipe, prompts: Prompt[]): Promise<Recipe> => {
        let interactiveCommand = new InteractiveCommands(prompts);
        interactiveCommand.attach(this);
        return interactiveCommand.interogate()
            .then(_ => console.log('done interogating'))
            .then(_ => interactiveCommand.detach(this))
            .then(_ => recipe);   
    }

    private createPrompts = (recipe: Recipe): Prompt[] => {
        let prompts: Prompt[] = recipe.projects.map(p => {
            return new Prompt(`Rename '${p.name}': `, this.validator)
        });
        return prompts;
    }

    private validator = (answer: string): boolean => {
        return true;
    }

    private addProjectToShamanFile = (): Promise<void> => {
        return this.fileService.getShamanFile(this.filePath)
            .then(shamanFile => {
                console.dir(shamanFile);
            });
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
