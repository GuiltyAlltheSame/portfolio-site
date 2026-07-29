import { openGameScreen, showGameMenu, showGameStage } from '../game-shell.js';
import { registerGame } from '../registry.js';
import { pballTemplate } from './pball-template.js';
import { initPBallSetup } from './pball-setup.js';

export function registerPBallGame() {
  let pballRuntime = null;

  const pballGame = {
    title: 'P-BALL',
    description: 'start P-BALL game',

    openMenu() {
      if (pballRuntime) {
        pballRuntime.stop();
      }

      openGameScreen({
        title: 'P-BALL',
        template: pballTemplate
      });

      pballRuntime = initPBallSetup({
        pballStartBtn: document.getElementById('pball-start'),
        pballResetBtn: document.getElementById('pball-reset'),
        showGameMenu,
        showGameStage
      });
    },

    start() {
      if (pballRuntime && typeof pballRuntime.start === 'function') {
        pballRuntime.start();
      }
    },

    stop() {
      if (pballRuntime && typeof pballRuntime.stop === 'function') {
        pballRuntime.stop();
      }

      pballRuntime = null;
    }
  };

  registerGame('PBALL', pballGame);
}
