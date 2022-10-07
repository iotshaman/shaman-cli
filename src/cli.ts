import { ICommand } from "./commands/command";
import { NoopCommand } from "./commands/default/noop.command";
import { EchoCommand } from "./commands/default/echo.command";
import { ScaffoldCommand, ScaffoldSolutionCommand } from "./commands/scaffold/scaffold.command";
import { BuildCommand } from "./commands/build/build.command";
import { InstallCommand } from "./commands/install/install.command";
import { RunCommand } from "./commands/run/run.command";
import { ServeCommand } from "./commands/serve/serve.command";
import { VersionCommand } from "./commands/version/version.command";
import { PublishCommand } from "./commands/publish/publish.command";
import { CommandLineArguments } from "./command-line-arguments";

const commands: ICommand[] = [
  new NoopCommand(),
  new EchoCommand(),
  new ScaffoldCommand(),
  new ScaffoldSolutionCommand(),
  new BuildCommand(),
  new InstallCommand(),
  new RunCommand(),
  new ServeCommand(),
  new VersionCommand(),
  new PublishCommand()
];

export function Invoke(argv: string[]) {
  if (argv.length < 3) return Promise.reject(new Error("No arguments provided."));
  let cla: CommandLineArguments = new CommandLineArguments(argv);
  let cmd = commands.find(c => c.name == cla.command);
  if (!cmd) return Promise.reject(new Error(`Invalid command '${cla.command}'.`));
  return cmd.run(cla);
}