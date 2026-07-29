import { listGames } from '../games/registry.js';

export function createTerminalCommands({ out }) {
  function getGamesHelpText() {
    const games = listGames();

    if (games.length === 0) {
      return '  no games registered';
    }

    return games
      .map((game) => {
        const description = game.description || `start ${game.title}`;
        return `  ${game.command.padEnd(14)} - ${description}`;
      })
      .join('\n');
  }

  function getHelpText() {
    return `
Commands:
  CLEAR          - clear screen
  GAMES          - list available games
  HELP  or  ?    - list of commands

Games (type a game command to launch it):
${getGamesHelpText()}
`;
  }

  const commands = {
    CLEAR() {
      out.textContent = '';
    },

    GAMES() {
      out.textContent += '\n' + getGamesHelpText() + '\n';
      out.scrollTop = out.scrollHeight;
    },

    HELP() {
      out.textContent += '\n' + getHelpText().trim() + '\n';
      out.scrollTop = out.scrollHeight;
    }
  };

  commands['?'] = commands.HELP;

  return commands;
}
