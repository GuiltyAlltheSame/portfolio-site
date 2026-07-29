import { openGameScreen, showGameMenu, showGameStage } from '../game-shell.js';
import { registerGame } from '../registry.js';
import { pongTemplate } from './pong-template.js';
import { initPongSetup } from './pong-setup.js';

export function registerPongGame() {
  let pongRuntime = null;

  const pongGame = {
    title: 'P-BALL',
    description: 'start P-BALL game',

    openMenu() {
      if (pongRuntime) {
        pongRuntime.stop();
      }

      openGameScreen({
        title: 'P-BALL',
        template: pongTemplate
      });

      pongRuntime = initPongSetup({
        pongStartBtn: document.getElementById('pong-start'),
        pongResetBtn: document.getElementById('pong-reset'),
        showGameMenu,
        showGameStage
      });
    },

    start() {
      if (pongRuntime && typeof pongRuntime.start === 'function') {
        pongRuntime.start();
      }
    },

    stop() {
      if (pongRuntime && typeof pongRuntime.stop === 'function') {
        pongRuntime.stop();
      }

      pongRuntime = null;
    }
  };

  registerGame('PBALL', pongGame);
}
