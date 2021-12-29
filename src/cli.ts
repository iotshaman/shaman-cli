#!/usr/bin/env node
import { ICommand } from "./commands/command";
import { EchoCommand } from "./commands/echo.command";

const commands: ICommand[] = [
  new EchoCommand()
];

export function Invoke() {
  if (process.argv.length < 3) throw new Error("Invalid number of arguments.");
  const [command] = process.argv.slice(2);
  const args = process.argv.slice(3);
  let cmd = commands.find(c => c.name == command);
  if (!cmd) throw new Error(`Invalid command '${command}'.`)
  return cmd.run(...args);
}

/* istanbul ignore next */
(function() { Invoke(); })();