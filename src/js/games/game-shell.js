function getShellEls() {
  return {
    out: document.getElementById('code-output'),
    cmdInput: document.getElementById('cmd-input'),
    gameScreen: document.getElementById('game-screen'),
    gameStage: document.getElementById('game-stage'),
    gameMenu: document.getElementById('game-menu'),
    gameTitle: document.getElementById('game-title')
  };
}

export function openGameScreen(title = 'GAME') {
  const { out, cmdInput, gameScreen, gameStage, gameMenu, gameTitle } = getShellEls();

  gameTitle.textContent = title;

  out.classList.add('hidden');

  gameScreen.classList.remove('hidden');
  gameScreen.setAttribute('aria-hidden', 'false');

  gameMenu.classList.remove('hidden');
  gameMenu.setAttribute('aria-hidden', 'false');

  gameStage.classList.add('hidden');
  gameStage.setAttribute('aria-hidden', 'true');

  cmdInput.placeholder = 'game menu...';
}

export function showGameStage() {
  const { cmdInput, gameStage, gameMenu } = getShellEls();

  gameMenu.classList.add('hidden');
  gameMenu.setAttribute('aria-hidden', 'true');

  gameStage.classList.remove('hidden');
  gameStage.setAttribute('aria-hidden', 'false');

  cmdInput.placeholder = 'game running...';
}

export function showGameMenu() {
  const { cmdInput, gameStage, gameMenu } = getShellEls();

  gameStage.classList.add('hidden');
  gameStage.setAttribute('aria-hidden', 'true');

  gameMenu.classList.remove('hidden');
  gameMenu.setAttribute('aria-hidden', 'false');

  cmdInput.placeholder = 'game menu...';
}

export function closeGameScreen(onClose) {
  const { out, cmdInput, gameScreen, gameStage, gameMenu } = getShellEls();

  if (typeof onClose === 'function') {
    onClose();
  }

  gameScreen.classList.add('hidden');
  gameScreen.setAttribute('aria-hidden', 'true');

  gameStage.classList.add('hidden');
  gameStage.setAttribute('aria-hidden', 'true');

  gameMenu.classList.remove('hidden');
  gameMenu.setAttribute('aria-hidden', 'false');

  out.classList.remove('hidden');

  cmdInput.placeholder = 'type command...';
  cmdInput.focus();
}