import { CommandLineArguments } from "../../command-line-arguments";
import { ProjectTransformation, Solution, SolutionProject } from "../../models/solution";
import { FileService, IFileService } from "../../services/file.service";
import { IRecipeService, RecipeService } from "../../services/recipe.service";
import { ITemplateService, TemplateService } from "../../services/template.service";
import { ICommand } from "../command";
import { ScaffoldCommand } from '../scaffold/scaffold.command';
import { GenerateCommandPrompts, IGenerateCommandPrompts } from "./generate.command.prompts";

export class GenerateCommand implements ICommand {
    get name(): string { return "generate"; }
    fileService: IFileService = new FileService();
    templateService: ITemplateService = new TemplateService();
    recipeService: IRecipeService = new RecipeService();
    scaffoldCommand: ICommand = new ScaffoldCommand();
    prompts: IGenerateCommandPrompts = new GenerateCommandPrompts();

    private params = {
        solutionName: <string>null,
        filePath: <string>null,
        template: <string>null,
        recipeName: <string>null,
        addFlag: <boolean>null
    }

    private defaultRecipeName: string;

    run = (cla: CommandLineArguments): Promise<void> => {
        this.assignArguments(cla);
        this.defaultRecipeName = cla.getDefault('recipe');
        if (this.params.addFlag) return this.addProjectsToShamanFile();
        return this.generateNewShamanFile();
    };

    private addProjectsToShamanFile = (): Promise<void> => {
        let shamanFile: Solution;
        console.log("Adding projects to solution...")
        return this.fileService.getShamanFile(this.params.filePath)
            .then(file => { shamanFile = file })
            .then(_ => {
                if (!!this.params.template) return this.prompts.askForProjectDetails(this.params.template).then(p => [p]);
                return this.constructMultipleProjects();
            })
            .then(projects => { shamanFile.projects.push(...projects) })
            .then(_ => this.fileService.writeJson(this.params.filePath, shamanFile))
            .then(_ => this.scaffoldSolution())
            .then(_ => console.log("Projects successfully added to solution."));
    }

    private generateNewShamanFile = (): Promise<void> => {
        return this.fileService.pathExists(this.params.filePath)
            .then(exists => { if (exists) throw new Error(`shaman.json file already exists at '${this.params.filePath}'`); })
            .then(_ => {
                if (!this.params.solutionName) return this.prompts.askForSolutionName()
                    .then(name => this.params.solutionName = name)
            })
            .then(_ => {
                if (this.params.recipeName == this.defaultRecipeName && !this.params.template)
                    return this.prompts.askForGenerationMethod()
                        .then(rslt => {
                            if (rslt == 'recipe') return this.generateFromRecipe();
                            return this.generateFromTemplates();
                        });
                if (!!this.params.template) return this.generateFromTemplates();
                return this.generateFromRecipe();
            })
            .then(_ => this.scaffoldSolution())
            .then(_ => console.log("Solution generation is complete."));
    }

    private generateFromRecipe = (): Promise<void> => {
        return Promise.resolve()
            .then(_ => {
                if (this.params.recipeName == this.defaultRecipeName)
                    return this.prompts.askForRecipe()
                        .then(recipe => { if (!!recipe) this.params.recipeName = recipe })
            })
            .then(_ => this.recipeService.getRecipe(this.params.recipeName))
            .then(recipe => this.prompts.askToRenameRecipeProjects(recipe))
            .then(updatedRecipe => this.generateShamanFile(updatedRecipe.projects, updatedRecipe.transform))
    }

    private generateFromTemplates = (): Promise<void> => {
        return Promise.resolve()
            .then(_ => {
                if (!!this.params.template)
                    return this.prompts.askForProjectDetails(this.params.template).then(p => [p])
                return this.constructMultipleProjects()
            })
            .then(projects => this.checkTemplateRequirements(projects))
            .then(projects => this.generateShamanFile(projects))
    }

    private constructMultipleProjects = (projects?: SolutionProject[]): Promise<SolutionProject[]> => {
        if (!projects) projects = [];
        return this.prompts.askForTemplateName()
            .then(templateName => this.prompts.askForProjectDetails(templateName))
            .then(newProject => projects.push(newProject))
            .then(_ => this.prompts.askIfAddingAnotherProject())
            .then(addingAnother => { if (addingAnother) return this.constructMultipleProjects(projects); })
            .then(_ => projects);
    }

    private checkTemplateRequirements = (projects: SolutionProject[]): Promise<SolutionProject[]> => {
        const taskChain = projects.reduce((a, b) => a.then(_ => {
            return this.templateService.getTemplate(b.environment, b.type).then(template => {
                if (!template.requires) return;
                let missingRequirements = template.requires.filter(r => {
                    if (!projects.find(p => p.type == r)) return r;
                });
                if (missingRequirements.length == 0) return;
                return this.prompts.askToInstallRequiredTemplates(b.type, missingRequirements).then(agreedToInstall => {
                    if (!agreedToInstall) return;
                    return this.templateService.getRequiredTemplates(b.type, missingRequirements)
                        .then(rslt => this.prompts.askForRequiredTemplateDetails(rslt))
                        .then(newProjects => projects.push(...newProjects))
                });
            });
        }), Promise.resolve());
        return taskChain.then(_ => projects);
    }

    private generateShamanFile = (projects: SolutionProject[], transformations?: ProjectTransformation[]): Promise<void> => {
        console.log('Generating shaman.json file...');
        let solution: Solution = {
            name: this.params.solutionName,
            projects: projects,
            transform: !!transformations ? transformations : []
        }
        return this.fileService.writeJson(this.params.filePath, solution)
            .then(_ => console.log('Successfully generated shaman.json file.'));
    }

    private scaffoldSolution = (): Promise<void> => {
        let scaffoldArguments = new CommandLineArguments(
            ['', '', 'scaffold', `--filePath=${this.params.filePath}`]
        );
        return this.scaffoldCommand.run(scaffoldArguments);
    }

    assignArguments = (cla: CommandLineArguments) => {
        this.params.solutionName = cla.getValueOrDefault('name');
        this.params.filePath = cla.getValueOrDefault('filePath');
        this.params.template = cla.getValueOrDefault('template');
        this.params.recipeName = cla.getValueOrDefault('recipe');
        this.params.addFlag = cla.getFlag('-add');
    }

}
