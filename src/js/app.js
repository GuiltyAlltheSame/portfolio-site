import { initTerminalController } from './terminal/controller.js';
import {
  closeActiveTerminalApp,
  openNotesApp,
  openPomodoroApp
} from './terminal/apps/index.js';
import { createGameController } from './games/controller.js';
import { closeGameScreen } from './games/game-shell.js';
import { registerGames } from './games/index.js';
import { getGame } from './games/registry.js';
import { initSkillsCode } from './ui/skills-code.js';
import { codeSamples } from './data/code-samples.js';
import { demoProjects } from './data/projects.js';
import { initProjects } from './ui/projects.js';
import { initTabsUI } from './ui/tabs.js';
import { initClock } from './ui/clock.js';
import { initStarfield } from './ui/starfield.js';
import { initThemeSwitcher, openThemeSwitcher } from './ui/theme-switcher.js';
import { initTurnstile } from './ui/turnstile.js';
import { initMobileTerminal } from './ui/mobile-terminal.js';
import { initContactLayout } from './ui/contact-layout.js';
import { initTextScramble } from './ui/text-scramble.js';

document.addEventListener('DOMContentLoaded', () => {
  initStarfield(document.getElementById('starfield'));
  initTurnstile();
  initClock();
  initThemeSwitcher();
  initTextScramble();

  const out = document.getElementById('code-output');

  registerGames();

  const gameController = createGameController();
  gameController.bindExit();

  function openTerminalUtility(openUtility) {
    // A utility owns the terminal screen, so stop and clear any active game
    // before letting it replace that screen.
    gameController.stopActiveGame();
    closeGameScreen();
    openUtility();
  }

  function quitTerminalScreen() {
    if (closeActiveTerminalApp()) {
      return true;
    }

    const gameScreen = document.getElementById('game-screen');

    if (!gameScreen || gameScreen.classList.contains('hidden')) {
      return false;
    }

    closeGameScreen(() => gameController.stopActiveGame());
    return true;
  }

  /* ---- CLI and commands  --------------------------- */
  const cmdInput = document.getElementById('cmd-input');

  initTerminalController({
    out,
    cmdInput,
    onQuit: quitTerminalScreen,
    onBeforeOutput: quitTerminalScreen,
    onOpenTheme() {
      openTerminalUtility(openThemeSwitcher);
    },
    onOpenNotes() {
      openTerminalUtility(openNotesApp);
    },
    onOpenPomodoro() {
      openTerminalUtility(openPomodoroApp);
    },
    onGameCommand(key) {
      if (!getGame(key)) return false;
      closeActiveTerminalApp();
      return gameController.openByCommand(key);
    }
  });

  const mobileTerminal = initMobileTerminal({ onClose: quitTerminalScreen });
  initTabsUI({
    onBeforeChange({ from }) {
      if (from !== 'skills') return;
      gameController.stopActiveGame();
      const screen = document.getElementById('game-screen');
      if (!screen.classList.contains('hidden') && !screen.dataset.terminalApp) closeGameScreen();
      mobileTerminal.dismiss({ restoreFocus: false });
    }
  });
  initSkillsCode({ out, codeSamples, onSelect(trigger) {
    closeActiveTerminalApp();
    gameController.stopActiveGame();
    closeGameScreen();
    mobileTerminal.open({ trigger });
  } });
  initProjects({ projects: demoProjects });
  initContactLayout();

});



