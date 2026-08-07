let activeTerminalApp = null;

function getShell(overrides = {}) {
  return {
    out: overrides.out || document.getElementById('code-output'),
    cmdInput: overrides.cmdInput || document.getElementById('cmd-input'),
    screen: overrides.screen || document.getElementById('game-screen')
  };
}

function safelyRun(callback) {
  try {
    callback();
  } catch (error) {
    console.error('Terminal app cleanup failed.', error);
  }
}

export function closeActiveTerminalApp() {
  if (!activeTerminalApp) return false;

  activeTerminalApp.close();
  return true;
}

export function isTerminalAppOpen() {
  return Boolean(activeTerminalApp);
}

/**
 * Opens a small app inside the terminal screen. The returned API lets an app
 * register cleanup work (timers, event listeners) without depending on the
 * game controller.
 */
export function openTerminalApp({
  name,
  template,
  focusSelector,
  onOpen,
  shell: shellOverrides
} = {}) {
  closeActiveTerminalApp();

  const { out, cmdInput, screen } = getShell(shellOverrides);

  if (!out || !cmdInput || !screen) {
    console.warn(`Unable to open terminal app: ${name || 'unknown'}.`);
    return null;
  }

  const previousState = {
    placeholder: cmdInput.placeholder,
    disabled: cmdInput.disabled,
    screenMarkup: screen.innerHTML,
    screenHidden: screen.classList.contains('hidden'),
    screenAriaHidden: screen.getAttribute('aria-hidden')
  };
  const cleanupCallbacks = [];
  let isClosed = false;

  const api = {
    root: screen,
    addCleanup(callback) {
      if (typeof callback === 'function') {
        cleanupCallbacks.push(callback);
      }
    },
    close() {
      if (isClosed) return;

      isClosed = true;
      cleanupCallbacks.splice(0).reverse().forEach(safelyRun);

      screen.removeEventListener('click', handleScreenClick);
      document.removeEventListener('keydown', handleEscapeKey);
      screen.removeAttribute('data-terminal-app');
      screen.innerHTML = previousState.screenMarkup;

      if (previousState.screenHidden) {
        screen.classList.add('hidden');
      } else {
        screen.classList.remove('hidden');
      }

      if (previousState.screenAriaHidden === null) {
        screen.removeAttribute('aria-hidden');
      } else {
        screen.setAttribute('aria-hidden', previousState.screenAriaHidden);
      }

      out.classList.remove('hidden');
      cmdInput.placeholder = previousState.placeholder || 'type command...';
      cmdInput.disabled = previousState.disabled;
      activeTerminalApp = null;
      cmdInput.focus();
    }
  };

  function handleScreenClick(event) {
    if (event.target.closest('[data-terminal-app-close]')) {
      api.close();
    }
  }

  function handleEscapeKey(event) {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    api.close();
  }

  activeTerminalApp = api;
  clearInterval(out._timer);
  out.dataset.typing = 'false';
  out.classList.add('hidden');
  screen.classList.remove('hidden');
  screen.setAttribute('aria-hidden', 'false');
  screen.dataset.terminalApp = name || 'app';
  screen.innerHTML = template || '';
  cmdInput.placeholder = `${name || 'app'} open // type Q or QUIT to exit`;
  cmdInput.disabled = false;

  screen.addEventListener('click', handleScreenClick);
  document.addEventListener('keydown', handleEscapeKey);

  if (typeof onOpen === 'function') {
    onOpen(api);
  }

  if (focusSelector) {
    const focusTarget = screen.querySelector(focusSelector);
    if (focusTarget) {
      focusTarget.focus();
    }
  }

  return api;
}
