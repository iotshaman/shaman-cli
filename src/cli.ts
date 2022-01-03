import { ICommand } from "./commands/command";
import { NoopCommand } from "./commands/default/noop.command";
import { EchoCommand } from "./commands/default/echo.command";
import { ScaffoldCommand } from "./commands/scaffold/scaffold.command";
import { ScaffoldSolutionCommand } from "./commands/scaffold/scaffold-solution.command";
import { BuildCommand } from "./commands/build/build.command";
import { InstallCommand } from "./commands/install/install.command";

const commands: ICommand[] = [
  new NoopCommand(),
  new EchoCommand(),
  new ScaffoldCommand(),
  new ScaffoldSolutionCommand(),
  new BuildCommand(),
  new InstallCommand()
];

export function Invoke(args: string[]) {
  if (!args.length) return Promise.reject(new Error("No arguments provided."));
  const [command] = args.slice(0);
  const commandArgs = args.slice(1);
  let cmd = commands.find(c => c.name == command);
  if (!cmd) return Promise.reject(new Error(`Invalid command '${command}'.`));
  return cmd.run(...commandArgs);
}