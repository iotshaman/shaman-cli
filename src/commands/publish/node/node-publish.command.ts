import { Solution } from "../../../models/solution";
import { ICommand } from "../../command";

export class NodePublishCommand implements ICommand {
    get name(): string { return "publish-node" };
    run: (...args: string[]) => Promise<void>;
}