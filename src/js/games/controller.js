import { closeGameScreen, openGameBootScreen } from './game-shell.js';
import { getGame } from './registry.js';

const GAME_BOOT_DURATION_MS = 1000;

export function createGameController() {
  let activeGame = null;
  let bootTimer = null;
  let bootRequestId = 0;

  function clearBootTimer() {
    if (bootTimer) {
      clearTimeout(bootTimer);
      bootTimer = null;
    }

    bootRequestId++;
  }

  function openByCommand(command) {
    const game = getGame(command);

    if (!game) return false;

    clearBootTimer();

    if (activeGame && typeof activeGame.stop === 'function') {
      activeGame.stop();
    }

    activeGame = game;
    const requestId = bootRequestId;

    openGameBootScreen({
      title: game.title || game.command || command,
      duration: GAME_BOOT_DURATION_MS
    });

    bootTimer = setTimeout(() => {
      bootTimer = null;

      if (requestId !== bootRequestId || activeGame !== game) return;

      if (typeof game.openMenu === 'function') {
        game.openMenu();
      }
    }, GAME_BOOT_DURATION_MS);

    return true;
  }

  function startActiveGame() {
    if (activeGame && typeof activeGame.start === 'function') {
      activeGame.start();
    }
  }

  function stopActiveGame() {
    clearBootTimer();

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
