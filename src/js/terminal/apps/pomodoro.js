import { openTerminalApp } from './shell.js';

const MODES = {
  focus: {
    label: 'FOCUS SESSION',
    shortLabel: 'FOCUS',
    durationMs: 25 * 60 * 1000,
    next: 'short'
  },
  short: {
    label: 'SHORT BREAK',
    shortLabel: 'SHORT',
    durationMs: 5 * 60 * 1000,
    next: 'focus'
  },
  long: {
    label: 'LONG BREAK',
    shortLabel: 'LONG',
    durationMs: 15 * 60 * 1000,
    next: 'focus'
  }
};

const pomodoroTemplate = `
  <section class="terminal-app terminal-app--pomodoro" aria-labelledby="pomodoro-app-title">
    <header class="terminal-app__toolbar">
      <div class="terminal-app__heading">
        <span id="pomodoro-app-title" class="terminal-app__title">POMODORO</span>
        <span class="terminal-app__meta">FOCUS PROTOCOL // 25 / 5 / 15</span>
      </div>
      <button class="terminal-app__exit" type="button" data-terminal-app-close>EXIT</button>
    </header>

    <div class="pomodoro-app__body">
      <div class="pomodoro-app__mode-switch" role="tablist" aria-label="Pomodoro timer mode">
        <button class="pomodoro-app__mode" type="button" data-pomodoro-mode="focus" role="tab">FOCUS <span>25</span></button>
        <button class="pomodoro-app__mode" type="button" data-pomodoro-mode="short" role="tab">SHORT <span>05</span></button>
        <button class="pomodoro-app__mode" type="button" data-pomodoro-mode="long" role="tab">LONG <span>15</span></button>
      </div>

      <div class="pomodoro-app__display">
        <div id="pomodoro-dial" class="pomodoro-app__dial" aria-label="Pomodoro countdown">
          <div class="pomodoro-app__dial-core">
            <span id="pomodoro-mode-label" class="pomodoro-app__mode-label">FOCUS SESSION</span>
            <output id="pomodoro-time" class="pomodoro-app__time" aria-live="off">25:00</output>
            <span id="pomodoro-cycle" class="pomodoro-app__cycle">CYCLE 01 // 00 COMPLETE</span>
          </div>
        </div>

        <p id="pomodoro-status" class="pomodoro-app__status" aria-live="polite">READY TO FOCUS</p>
      </div>

      <div class="pomodoro-app__actions">
        <button id="pomodoro-reset" class="terminal-app__button terminal-app__button--quiet" type="button">RESET</button>
        <button id="pomodoro-start" class="terminal-app__button" type="button">START FOCUS</button>
        <button id="pomodoro-skip" class="terminal-app__button terminal-app__button--quiet" type="button">SKIP</button>
      </div>

      <p class="terminal-app__hint pomodoro-app__hint">ONE FOCUS SESSION AT A TIME // PAUSE WHEN LIFE INTERRUPTS</p>
    </div>
  </section>
`;

function formatRemainingTime(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function openPomodoroApp(options = {}) {
  const app = openTerminalApp({
    name: 'pomodoro',
    template: pomodoroTemplate,
    focusSelector: '#pomodoro-start',
    shell: options.shell
  });

  if (!app) return false;

  const root = app.root;
  const dial = root.querySelector('#pomodoro-dial');
  const time = root.querySelector('#pomodoro-time');
  const modeLabel = root.querySelector('#pomodoro-mode-label');
  const cycle = root.querySelector('#pomodoro-cycle');
  const status = root.querySelector('#pomodoro-status');
  const startButton = root.querySelector('#pomodoro-start');
  const resetButton = root.querySelector('#pomodoro-reset');
  const skipButton = root.querySelector('#pomodoro-skip');
  const modeButtons = [...root.querySelectorAll('[data-pomodoro-mode]')];

  let mode = 'focus';
  let remainingMs = MODES[mode].durationMs;
  let deadline = null;
  let timerId = null;
  let isRunning = false;
  let completedFocusSessions = 0;
  let statusMessage = 'READY TO FOCUS';

  function clearTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function updateDisplay() {
    const activeMode = MODES[mode];
    const duration = activeMode.durationMs;
    const progress = Math.min(360, Math.max(0, ((duration - remainingMs) / duration) * 360));

    dial.style.setProperty('--pomodoro-progress', `${progress}deg`);
    time.textContent = formatRemainingTime(remainingMs);
    modeLabel.textContent = activeMode.label;
    cycle.textContent = `CYCLE ${String((completedFocusSessions % 4) + 1).padStart(2, '0')} // ${String(completedFocusSessions).padStart(2, '0')} COMPLETE`;
    status.textContent = statusMessage;
    startButton.textContent = isRunning ? 'PAUSE' : `START ${activeMode.shortLabel}`;
    startButton.setAttribute('aria-label', isRunning ? 'Pause timer' : `Start ${activeMode.label.toLowerCase()}`);

    modeButtons.forEach((button) => {
      const isActive = button.dataset.pomodoroMode === mode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });
  }

  function stopTimer() {
    if (!isRunning) return;

    remainingMs = Math.max(0, deadline - Date.now());
    isRunning = false;
    deadline = null;
    clearTimer();
  }

  function setMode(nextMode, message) {
    stopTimer();
    mode = nextMode;
    remainingMs = MODES[mode].durationMs;
    statusMessage = message || `${MODES[mode].label} READY`;
    updateDisplay();
  }

  function finishTimer({ skipped = false } = {}) {
    clearTimer();
    isRunning = false;
    deadline = null;

    if (skipped) {
      setMode(MODES[mode].next, `SKIPPED // ${MODES[mode].next.toUpperCase()} READY`);
      return;
    }

    if (mode === 'focus') {
      completedFocusSessions += 1;
      const nextMode = completedFocusSessions % 4 === 0 ? 'long' : 'short';
      setMode(nextMode, `FOCUS COMPLETE // ${MODES[nextMode].label} READY`);
      return;
    }

    setMode('focus', 'BREAK COMPLETE // READY TO FOCUS');
  }

  function tick() {
    remainingMs = Math.max(0, deadline - Date.now());

    if (remainingMs <= 0) {
      finishTimer();
      return;
    }

    updateDisplay();
  }

  function startTimer() {
    if (isRunning) {
      stopTimer();
      statusMessage = 'PAUSED // RESUME WHEN READY';
      updateDisplay();
      return;
    }

    deadline = Date.now() + remainingMs;
    isRunning = true;
    statusMessage = `${MODES[mode].label} IN PROGRESS`;
    timerId = window.setInterval(tick, 250);
    updateDisplay();
  }

  function resetTimer() {
    stopTimer();
    remainingMs = MODES[mode].durationMs;
    statusMessage = `${MODES[mode].label} RESET`;
    updateDisplay();
  }

  function handleModeClick(event) {
    setMode(event.currentTarget.dataset.pomodoroMode);
  }

  modeButtons.forEach((button) => button.addEventListener('click', handleModeClick));
  startButton.addEventListener('click', startTimer);
  resetButton.addEventListener('click', resetTimer);
  skipButton.addEventListener('click', () => finishTimer({ skipped: true }));
  updateDisplay();

  app.addCleanup(() => {
    clearTimer();
    modeButtons.forEach((button) => button.removeEventListener('click', handleModeClick));
    startButton.removeEventListener('click', startTimer);
    resetButton.removeEventListener('click', resetTimer);
  });

  return true;
}
