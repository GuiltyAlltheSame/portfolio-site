import { startCraboidGame, stopCraboidGame } from './craboid.js';

export function initCraboidSetup({
  craboidStartBtn,
  craboidMenuBtn,
  showGameMenu,
  showGameStage
}) {
  function isInteractiveTarget(target) {
    return target instanceof Element && Boolean(
      target.closest('button, a, input, textarea, select, [contenteditable="true"]')
    );
  }

  function isMenuVisible() {
    const gameMenu = document.getElementById('game-menu');
    const skillsPanel = document.getElementById('skills');

    return Boolean(
      gameMenu &&
      !gameMenu.classList.contains('hidden') &&
      skillsPanel &&
      skillsPanel.classList.contains('active')
    );
  }

  function focusStartButton() {
    if (craboidStartBtn && isMenuVisible()) {
      craboidStartBtn.focus({ preventScroll: true });
    }
  }

  function showMenu() {
    stopCraboidGame();

    if (typeof showGameMenu === 'function') {
      showGameMenu();
    }

    focusStartButton();
  }

  function startGame() {
    stopCraboidGame();

    if (typeof showGameStage === 'function') {
      showGameStage();
    }

    startCraboidGame({
      onRequestMenu: showMenu
    });
  }

  function handleMenuKeydown(event) {
    if (
      event.key !== 'Enter' ||
      event.repeat ||
      isInteractiveTarget(event.target) ||
      !isMenuVisible()
    ) {
      return;
    }

    event.preventDefault();
    startGame();
  }

  if (craboidStartBtn) {
    craboidStartBtn.addEventListener('click', startGame);
  }

  if (craboidMenuBtn) {
    craboidMenuBtn.addEventListener('click', showMenu);
  }

  document.addEventListener('keydown', handleMenuKeydown);
  focusStartButton();

  return {
    start: startGame,

    stop() {
      stopCraboidGame();
      document.removeEventListener('keydown', handleMenuKeydown);
    }
  };
}
