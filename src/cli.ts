import { ICommand } from "./commands/command";
import { NoopCommand } from "./commands/default/noop.command";
import { EchoCommand } from "./commands/default/echo.command";
import { ScaffoldCommand } from "./commands/scaffold/scaffold.command";

const commands: ICommand[] = [
  new NoopCommand(),
  new EchoCommand(),
  new ScaffoldCommand()
];

export function Invoke(args: string[]) {
  if (!args.length) return Promise.reject(new Error("No arguments provided."));
  const [command] = args.slice(0);
  const commandArgs = args.slice(1);
  let cmd = commands.find(c => c.name == command);
  if (!cmd) return Promise.reject(new Error(`Invalid command '${command}'.`));
  return cmd.run(...commandArgs);
}