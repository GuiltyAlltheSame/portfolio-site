function getShellEls() {
  return {
    out: document.getElementById('code-output'),
    cmdInput: document.getElementById('cmd-input'),
    gameScreen: document.getElementById('game-screen')
  };
}

function getGameEls(gameScreen) {
  return {
    gameStage: gameScreen.querySelector('[data-game-stage], #game-stage'),
    gameMenu: gameScreen.querySelector('[data-game-menu], #game-menu'),
    gameTitle: gameScreen.querySelector('[data-game-title], #game-title')
  };
}

export function openGameScreen({ title = 'GAME', template = '' } = {}) {
  const { out, cmdInput, gameScreen } = getShellEls();

  if (template) {
    gameScreen.innerHTML = template;
  }

  const { gameStage, gameMenu, gameTitle } = getGameEls(gameScreen);

  if (gameTitle) {
    gameTitle.textContent = title;
  }

  out.classList.add('hidden');

  gameScreen.classList.remove('hidden');
  gameScreen.setAttribute('aria-hidden', 'false');

  if (gameMenu) {
    gameMenu.classList.remove('hidden');
    gameMenu.setAttribute('aria-hidden', 'false');
  }

  if (gameStage) {
    gameStage.classList.add('hidden');
    gameStage.setAttribute('aria-hidden', 'true');
  }

  cmdInput.placeholder = 'game menu...';
}

export function showGameStage() {
  const { cmdInput, gameScreen } = getShellEls();
  const { gameStage, gameMenu } = getGameEls(gameScreen);

  if (gameMenu) {
    gameMenu.classList.add('hidden');
    gameMenu.setAttribute('aria-hidden', 'true');
  }

  if (gameStage) {
    gameStage.classList.remove('hidden');
    gameStage.setAttribute('aria-hidden', 'false');
  }

  cmdInput.placeholder = 'game running...';
}

export function showGameMenu() {
  const { cmdInput, gameScreen } = getShellEls();
  const { gameStage, gameMenu } = getGameEls(gameScreen);

  if (gameStage) {
    gameStage.classList.add('hidden');
    gameStage.setAttribute('aria-hidden', 'true');
  }

  if (gameMenu) {
    gameMenu.classList.remove('hidden');
    gameMenu.setAttribute('aria-hidden', 'false');
  }

  cmdInput.placeholder = 'game menu...';
}

export function closeGameScreen(onClose) {
  const { out, cmdInput, gameScreen } = getShellEls();
  const { gameStage, gameMenu } = getGameEls(gameScreen);

  if (typeof onClose === 'function') {
    onClose();
  }

  gameScreen.classList.add('hidden');
  gameScreen.setAttribute('aria-hidden', 'true');

  if (gameStage) {
    gameStage.classList.add('hidden');
    gameStage.setAttribute('aria-hidden', 'true');
  }

  if (gameMenu) {
    gameMenu.classList.remove('hidden');
    gameMenu.setAttribute('aria-hidden', 'false');
  }

  gameScreen.innerHTML = '';

  out.classList.remove('hidden');

  cmdInput.placeholder = 'type command...';
  cmdInput.focus();
}
