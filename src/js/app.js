import { initTerminalController } from './terminal/controller.js';
import {
  closeActiveTerminalApp,
  openNotesApp,
  openPomodoroApp
} from './terminal/apps/index.js';
import { createGameController } from './games/controller.js';
import { closeGameScreen } from './games/game-shell.js';
import { registerGames } from './games/index.js';
import { initSkillsCode } from './ui/skills-code.js';
import { codeSamples } from './data/code-samples.js';
import { demoProjects } from './data/projects.js';
import { initProjects } from './ui/projects.js';
import { initTabsUI } from './ui/tabs.js';
import { initClock } from './ui/clock.js';
import { initStarfield } from './ui/starfield.js';
import { initThemeSwitcher, openThemeSwitcher } from './ui/theme-switcher.js';
import { initTurnstile } from './ui/turnstile.js';

document.addEventListener('DOMContentLoaded', () => {
  initStarfield(document.getElementById('starfield'));
  initTurnstile();
  initTabsUI();
  initClock();
  initThemeSwitcher();

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

  initSkillsCode({ out, codeSamples });

  /* ---- CLI and commands  --------------------------- */
  const cmdInput = document.getElementById('cmd-input');

  initTerminalController({
    out,
    cmdInput,
    onQuit: quitTerminalScreen,
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
      return gameController.openByCommand(key);
    }
  });

  initProjects({ projects: demoProjects });

});



