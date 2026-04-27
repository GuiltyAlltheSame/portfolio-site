import { initTerminalController } from './terminal/controller.js';
import { createGameController } from './games/controller.js';
import { initPongSetup } from './games/pong-setup.js';
import { initSkillsCode } from './ui/skills-code.js';
import { codeSamples } from './data/code-samples.js';
import { demoProjects } from './data/projects.js';
import { initProjects } from './ui/projects.js';
import { initTabsUI } from './ui/tabs.js';
import { initClock } from './ui/clock.js';

document.addEventListener('DOMContentLoaded', () => {
  initTabsUI();
  initClock();

  const out = document.getElementById('code-output');
  const gameExit   = document.getElementById('game-exit');
  const pongStartBtn   = document.getElementById('pong-start');
  const pongDifficulty = document.getElementById('pong-difficulty');

  const gameController = createGameController({ gameExit });
  gameController.bindExit();

  initSkillsCode({ out, codeSamples });

  /* ---- CLI and commands  --------------------------- */
  const cmdInput = document.getElementById('cmd-input');

  initPongSetup({ pongStartBtn, pongDifficulty });

  initTerminalController({
    out,
    cmdInput,
    onGameCommand(key) {
      return gameController.openByCommand(key);
  }
});

  initProjects({ projects: demoProjects });

});



