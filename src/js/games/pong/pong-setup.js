import { startPongGame, stopPongGame } from './pong.js';
import { startPongDemo, stopPongDemo } from './pong-demo.js';

const PONG_PRESETS = {
  easy:   { playerSpeed: 5, aiLerp: 0.035, ballSpeedX: 5,  ballSpeedY: 3, hitPoints: 5,  goalPoints: 50 },
  normal: { playerSpeed: 5, aiLerp: 0.05,  ballSpeedX: 7,  ballSpeedY: 4, hitPoints: 10, goalPoints: 100 },
  hard:   { playerSpeed: 6, aiLerp: 0.075, ballSpeedX: 9,  ballSpeedY: 6, hitPoints: 20, goalPoints: 200 },
  insane: { playerSpeed: 7, aiLerp: 0.11,  ballSpeedX: 12, ballSpeedY: 8, hitPoints: 35, goalPoints: 350 }
};

function enableOptionalRadioGroups() {
  document.querySelectorAll('.pong-radio').forEach((label) => {
    const radio = label.querySelector('input[type="radio"]');

    if (!radio) {
      return;
    }

    let wasCheckedBeforeClick = false;

    label.addEventListener('pointerdown', () => {
      wasCheckedBeforeClick = radio.checked;
    });

    label.addEventListener('click', (event) => {
      if (!wasCheckedBeforeClick) {
        wasCheckedBeforeClick = false;
        return;
      }

      event.preventDefault();

      radio.checked = false;
      radio.focus({ preventScroll: true });
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      wasCheckedBeforeClick = false;
    });

    radio.addEventListener('keydown', (event) => {
      const isSpace = event.key === ' ' || event.key === 'Spacebar';

      if (!isSpace || !radio.checked) {
        return;
      }

      event.preventDefault();

      radio.checked = false;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

export function initPongSetup({
  pongStartBtn,
  pongResetBtn,
  showGameMenu,
  showGameStage
}) {
  enableOptionalRadioGroups();
  startPongDemo();

  function showMenu() {
    stopPongGame();

    if (typeof showGameMenu === 'function') {
      showGameMenu();
    }

    startPongDemo();
  }

  function showGame() {
    stopPongDemo();

    if (typeof showGameStage === 'function') {
      showGameStage();
    }
  }

  function startGame() {
    const selectedInput = document.querySelector('input[name="pongDifficulty"]:checked');
    const selected = selectedInput ? selectedInput.value : 'normal';
    const selectedLimitInput = document.querySelector('input[name="pongScoreLimit"]:checked');
    const selectedLimit = selectedLimitInput ? selectedLimitInput.value : 'infinity';
    const scoreLimit = selectedLimit === 'infinity' ? null : Number(selectedLimit);

    showGame();
    startPongGame({ ...PONG_PRESETS[selected], scoreLimit });
  }

  if (pongStartBtn) {
    pongStartBtn.addEventListener('click', startGame);
  }

  if (pongResetBtn) {
    pongResetBtn.addEventListener('click', showMenu);
  }

  return {
    start: startGame,

    stop() {
      stopPongGame();
      stopPongDemo();
    }
  };
}
