#!/usr/bin/env node
import { ICommand } from "./commands/command";
import { EchoCommand } from "./commands/echo.command";

const commands: ICommand[] = [
  new EchoCommand()
];

export function Invoke(args: string[]) {
  if (args.length < 3) return Promise.reject(new Error("Invalid number of arguments."));
  const [command] = args.slice(2);
  const commandArgs = args.slice(3);
  let cmd = commands.find(c => c.name == command);
  if (!cmd) return Promise.reject(new Error(`Invalid command '${command}'.`));
  return cmd.run(...commandArgs);
}

/* istanbul ignore next */
(function() { 
  Invoke(process.argv).catch(ex => {
    console.error(ex);
  });
})();