import { closeGameScreen } from './game-shell.js';
import { runGameCommand } from './registry.js';

export function createGameController({ gameExit }) {
  let activeGame = null;

  function openByCommand(command) {
    const game = runGameCommand(command);

    if (!game) return false;

    activeGame = game;
    return true;
  }

  function startActiveGame() {
    if (activeGame && typeof activeGame.start === 'function') {
      activeGame.start();
    }
  }

  function stopActiveGame() {
    if (activeGame && typeof activeGame.stop === 'function') {
      activeGame.stop();
    }
    activeGame = null;
  }

  function bindExit() {
    if (!gameExit) return;

    gameExit.addEventListener('click', () => {
      closeGameScreen(() => {
        stopActiveGame();
      });
    });
  }

  return {
    openByCommand,
    startActiveGame,
    stopActiveGame,
    bindExit
  };
}