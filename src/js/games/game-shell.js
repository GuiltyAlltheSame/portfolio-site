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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function revealGameScreen(placeholder) {
  const { out, cmdInput, gameScreen } = getShellEls();

  out.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  gameScreen.setAttribute('aria-hidden', 'false');
  cmdInput.placeholder = placeholder;

  return { out, cmdInput, gameScreen };
}

export function openGameBootScreen({ title = 'GAME', duration = 1000 } = {}) {
  const { gameScreen } = revealGameScreen('loading game... // Q to exit');

  gameScreen.innerHTML = `
    <div class="game-boot" style="--game-boot-duration: ${duration}ms">
      <div class="game-boot-title">${escapeHtml(title)}</div>
      <div class="game-boot-progress" aria-hidden="true">
        <span class="game-boot-progress-fill"></span>
      </div>
    </div>
  `;
}

export function openGameScreen({ title = 'GAME', template = '' } = {}) {
  const { gameScreen } = revealGameScreen('game menu... // Q to exit');

  if (template) {
    gameScreen.innerHTML = template;
  }

  const { gameStage, gameMenu, gameTitle } = getGameEls(gameScreen);

  if (gameTitle) {
    gameTitle.textContent = title;
  }

  if (gameMenu) {
    gameMenu.classList.remove('hidden');
    gameMenu.setAttribute('aria-hidden', 'false');
  }

  if (gameStage) {
    gameStage.classList.add('hidden');
    gameStage.setAttribute('aria-hidden', 'true');
  }

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

  cmdInput.placeholder = 'game running... // Q to exit';
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

  cmdInput.placeholder = 'game menu... // Q to exit';
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
