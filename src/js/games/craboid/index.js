import { openGameScreen, showGameMenu, showGameStage } from '../game-shell.js';
import { registerGame } from '../registry.js';
import { initCraboidSetup } from './craboid-setup.js';
import { craboidTemplate } from './craboid-template.js';

export function registerCraboidGame() {
  let craboidRuntime = null;

  const craboidGame = {
    title: 'CRABOID',
    description: 'launch sector defense protocol',

    openMenu() {
      if (craboidRuntime) {
        craboidRuntime.stop();
      }

      openGameScreen({
        title: 'CRABOID',
        template: craboidTemplate
      });

      craboidRuntime = initCraboidSetup({
        craboidStartBtn: document.getElementById('craboid-start'),
        craboidMenuBtn: document.getElementById('craboid-menu-button'),
        showGameMenu,
        showGameStage
      });
    },

    start() {
      if (craboidRuntime && typeof craboidRuntime.start === 'function') {
        craboidRuntime.start();
      }
    },

    stop() {
      if (craboidRuntime && typeof craboidRuntime.stop === 'function') {
        craboidRuntime.stop();
      }

      craboidRuntime = null;
    }
  };

  registerGame('CRABOID', craboidGame);
}
