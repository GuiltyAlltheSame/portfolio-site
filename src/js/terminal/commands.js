import { listGames } from '../games/registry.js';
import { evaluateMathExpression, MathExpressionError } from './math.js';

export function createTerminalCommands({
  out,
  onQuit,
  onOpenTheme,
  onOpenNotes,
  onOpenPomodoro
}) {
  function appendOutput(message) {
    if (!out) return;

    clearInterval(out._timer);
    out.dataset.typing = 'false';
    out.textContent += `\n${message.trim()}\n`;
    out.scrollTop = out.scrollHeight;
  }

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
  Q  or  QUIT    - exit active application or game
  THEME          - open CRT color profiles
  NOTES          - open local quick notes
  POMODORO       - open focus timer (POMO also works)
  CALC <expr>    - calculate a math expression (MATH also works)
  HELP  or  ?    - list of commands

Math:
  The terminal understands math directly. Try: 2 * (4 + 3), 2^10, or CALC 12 / 5
  Supported: +  -  *  /  %  ^  ( )  decimals

Games (type a game command to launch it):
${getGamesHelpText()}
`;
  }

  function openUtility(callback, utilityName) {
    if (typeof callback !== 'function') {
      appendOutput(`${utilityName} is unavailable.`);
      return;
    }

    callback();
  }

  function quitActiveScreen() {
    if (typeof onQuit === 'function' && onQuit()) {
      return;
    }

    appendOutput('QUIT // no application or game is active');
  }

  function normalizeMathInput(expression) {
    return expression
      .replace(/[\u00d7x]/gi, '*')
      .replace(/\u00f7/g, '/')
      .replace(/[\u2212\u2013\u2014]/g, '-')
      .replace(/,/g, '.');
  }

  function formatMathResult(value) {
    if (Object.is(value, -0)) return '0';

    // Keep normal calculator answers readable without exposing most
    // floating-point representation artefacts such as 0.30000000000000004.
    return String(Number.parseFloat(value.toPrecision(15)));
  }

  function calculate(expression) {
    const displayExpression = expression.trim();

    if (!displayExpression) {
      appendOutput('MATH // enter an expression\nExample: CALC 2 * (4 + 3)');
      return;
    }

    try {
      const result = evaluateMathExpression(normalizeMathInput(displayExpression));
      appendOutput(`MATH // ${displayExpression}\n= ${formatMathResult(result)}`);
    } catch (error) {
      const message = error instanceof MathExpressionError
        ? error.message
        : 'Unable to calculate that expression.';
      appendOutput(`MATH ERROR // ${message}`);
    }
  }

  const commands = {
    CLEAR() {
      clearInterval(out._timer);
      out.dataset.typing = 'false';
      out.textContent = '';
    },

    GAMES() {
      appendOutput(getGamesHelpText());
    },

    QUIT() {
      quitActiveScreen();
    },

    HELP() {
      appendOutput(getHelpText());
    },

    THEME() {
      openUtility(onOpenTheme, 'THEME');
    },

    NOTES() {
      openUtility(onOpenNotes, 'NOTES');
    },

    POMODORO() {
      openUtility(onOpenPomodoro, 'POMODORO');
    },

    CALC({ args = '' } = {}) {
      calculate(args);
    }
  };

  commands['?'] = commands.HELP;
  commands.Q = commands.QUIT;
  commands.POMO = commands.POMODORO;
  commands.MATH = commands.CALC;

  return commands;
}
