import { closeGameScreen } from './game-shell.js';
import { getGame } from './registry.js';

export function createGameController() {
  let activeGame = null;

  function openByCommand(command) {
    const game = getGame(command);

    if (!game) return false;

    if (activeGame && typeof activeGame.stop === 'function') {
      activeGame.stop();
    }

    activeGame = game;

    if (typeof game.openMenu === 'function') {
      game.openMenu();
    }

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
    const gameScreen = document.getElementById('game-screen');

    if (!gameScreen) return;

    gameScreen.addEventListener('click', (event) => {
      const closeButton = event.target.closest('[data-game-close]');

      if (!closeButton) return;

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
