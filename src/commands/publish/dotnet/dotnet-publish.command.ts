import { Solution } from "../../../models/solution";
import { ICommand } from "../../command";

export class DotnetPublishCommand implements ICommand {
    get name(): string { return "publish-dotnet" };
    run: (...args: string[]) => Promise<void>;
}