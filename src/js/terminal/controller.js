import { createTerminalCommands } from './commands.js';
import { initTerminalInput } from './input.js';

export function initTerminalController({
  out,
  cmdInput,
  onGameCommand,
  onQuit,
  onOpenTheme,
  onOpenNotes,
  onOpenPomodoro,
  onBeforeOutput
}) {
  const commands = createTerminalCommands({
    out,
    onQuit,
    onOpenTheme,
    onOpenNotes,
    onOpenPomodoro
  });

  return initTerminalInput({
    cmdInput,
    commands,
    out,
    onGameCommand,
    onBeforeOutput
  });
}
