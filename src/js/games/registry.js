const gamesRegistry = new Map();

export function registerGame(command, handlers) {
  gamesRegistry.set(command.toUpperCase(), handlers);
}

export function getGame(command) {
  return gamesRegistry.get(command.toUpperCase()) || null;
}

export function runGameCommand(command) {
  const game = getGame(command);

  if (!game) return null;

  if (typeof game.openMenu === 'function') {
    game.openMenu();
  }

  return game;
}