import { startPBallGame, stopPBallGame } from './pball.js';
import { startPBallDemo, stopPBallDemo } from './pball-demo.js';

const PBALL_PRESETS = {
  easy:   { playerSpeed: 5, aiLerp: 0.04, ballSpeedX: 6,  ballSpeedY: 3.5, hitPoints: 5,  goalPoints: 50 },
  normal: { playerSpeed: 6, aiLerp: 0.06, ballSpeedX: 8,  ballSpeedY: 5,   hitPoints: 10, goalPoints: 100 },
  hard:   { playerSpeed: 7, aiLerp: 0.09, ballSpeedX: 10, ballSpeedY: 7,   hitPoints: 20, goalPoints: 200 },
  insane: { playerSpeed: 8, aiLerp: 0.13, ballSpeedX: 13, ballSpeedY: 9,   hitPoints: 35, goalPoints: 350 }
};

function enableOptionalRadioGroups() {
  document.querySelectorAll('.pball-radio').forEach((label) => {
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

export function initPBallSetup({
  pballStartBtn,
  pballResetBtn,
  showGameMenu,
  showGameStage
}) {
  enableOptionalRadioGroups();
  startPBallDemo();

  function showMenu() {
    stopPBallGame();

    if (typeof showGameMenu === 'function') {
      showGameMenu();
    }

    startPBallDemo();
  }

  function showGame() {
    stopPBallDemo();

    if (typeof showGameStage === 'function') {
      showGameStage();
    }
  }

  function startGame() {
    const selectedInput = document.querySelector('input[name="pballDifficulty"]:checked');
    const selected = selectedInput ? selectedInput.value : 'normal';
    const selectedLimitInput = document.querySelector('input[name="pballScoreLimit"]:checked');
    const selectedLimit = selectedLimitInput ? selectedLimitInput.value : 'infinity';
    const scoreLimit = selectedLimit === 'infinity' ? null : Number(selectedLimit);

    showGame();
    startPBallGame({ ...PBALL_PRESETS[selected], scoreLimit });
  }

  if (pballStartBtn) {
    pballStartBtn.addEventListener('click', startGame);
  }

  if (pballResetBtn) {
    pballResetBtn.addEventListener('click', showMenu);
  }

  return {
    start: startGame,

    stop() {
      stopPBallGame();
      stopPBallDemo();
    }
  };
}
