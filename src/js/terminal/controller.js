import { createTerminalCommands } from './commands.js';
import { initTerminalInput } from './input.js';

export function initTerminalController({
  out,
  cmdInput,
  onGameCommand,
  onQuit,
  onOpenTheme,
  onOpenNotes,
  onOpenPomodoro
}) {
  const commands = createTerminalCommands({
    out,
    onQuit,
    onOpenTheme,
    onOpenNotes,
    onOpenPomodoro
  });

  initTerminalInput({
    cmdInput,
    commands,
    out,
    onGameCommand
  });
}
