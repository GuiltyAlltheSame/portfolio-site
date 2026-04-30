const gamesRegistry = new Map();

export function registerGame(command, handlers) {
  const normalizedCommand = command.toUpperCase();

  gamesRegistry.set(normalizedCommand, {
    command: normalizedCommand,
    title: normalizedCommand,
    description: '',
    ...handlers
  });
}

export function getGame(command) {
  return gamesRegistry.get(command.toUpperCase()) || null;
}

export function listGames() {
  return [...gamesRegistry.values()]
    .map(({ command, title, description }) => ({ command, title, description }))
    .sort((a, b) => a.command.localeCompare(b.command));
}

export function runGameCommand(command) {
  const game = getGame(command);

  if (!game) return null;

  if (typeof game.openMenu === 'function') {
    game.openMenu();
  }

  return game;
}
