import { openGameScreen, showGameStage } from './game-shell.js';
import { registerGame } from './registry.js';
import { startPongGame, stopPongGame } from './pong.js';

const PONG_PRESETS = {
  easy:   { playerSpeed: 5, aiLerp: 0.035, ballSpeedX: 5,  ballSpeedY: 3 },
  normal: { playerSpeed: 5, aiLerp: 0.05,  ballSpeedX: 7,  ballSpeedY: 4 },
  hard:   { playerSpeed: 6, aiLerp: 0.075, ballSpeedX: 9,  ballSpeedY: 6 },
  insane: { playerSpeed: 7, aiLerp: 0.11,  ballSpeedX: 12, ballSpeedY: 8 }
};

export function initPongSetup({ pongStartBtn, pongDifficulty }) {
  const pongGame = {
    openMenu() {
      openGameScreen('PONG');
    },

    start() {
      const selected = pongDifficulty.value;
      showGameStage();
      startPongGame(PONG_PRESETS[selected]);
    },

    stop() {
      stopPongGame();
    }
  };

  registerGame('PONG', pongGame);

  pongStartBtn.addEventListener('click', () => {
    pongGame.start();
  });
}