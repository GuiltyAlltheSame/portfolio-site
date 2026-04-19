const gamesRegistry = new Map();

export function registerGame(command, handlers) {
  gamesRegistry.set(command.toUpperCase(), handlers);
}

export function runGameCommand(command) {
  const game = gamesRegistry.get(command.toUpperCase());

  if (!game) return false;

  if (typeof game.openMenu === 'function') {
    game.openMenu();
  }

  return true;
}