import { initTerminalController } from './terminal/controller.js';
import { createGameController } from './games/controller.js';
import { registerGames } from './games/index.js';
import { initSkillsCode } from './ui/skills-code.js';
import { codeSamples } from './data/code-samples.js';
import { demoProjects } from './data/projects.js';
import { initProjects } from './ui/projects.js';
import { initTabsUI } from './ui/tabs.js';
import { initClock } from './ui/clock.js';
import { initStarfield } from './ui/starfield.js';

document.addEventListener('DOMContentLoaded', () => {
  initStarfield(document.getElementById('starfield'));
  initTabsUI();
  initClock();

  const out = document.getElementById('code-output');

  registerGames();

  const gameController = createGameController();
  gameController.bindExit();

  initSkillsCode({ out, codeSamples });

  /* ---- CLI and commands  --------------------------- */
  const cmdInput = document.getElementById('cmd-input');

  initTerminalController({
    out,
    cmdInput,
    onGameCommand(key) {
      return gameController.openByCommand(key);
  }
});

  initProjects({ projects: demoProjects });

});



