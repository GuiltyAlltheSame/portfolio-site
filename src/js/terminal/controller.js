import { createTerminalCommands } from './commands.js';
import { initTerminalInput } from './input.js';

export function initTerminalController({ out, cmdInput, onGameCommand }) {
  const commands = createTerminalCommands({ out });

  initTerminalInput({
    cmdInput,
    commands,
    out,
    onGameCommand
  });
}