export function createTerminalCommands({ out }) {
  const helpText = `
Commands:
  CLEAR          — clear screen
  PONG           — start PONG game
  HELP  or  ?    — list of commands
`;

  const commands = {
    CLEAR() {
      out.textContent = '';
    },

    HELP() {
      out.textContent += '\n' + helpText.trim() + '\n';
      out.scrollTop = out.scrollHeight;
    }
  };

  commands['?'] = commands.HELP;

  return commands;
}