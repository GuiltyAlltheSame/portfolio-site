const menuInvaders = Array.from({ length: 27 }, (_, index) => (
  `<span class="craboid-menu-invader" style="--craboid-cell: ${index}"></span>`
)).join('');

export const craboidTemplate = `
  <div class="game-toolbar">
    <div class="craboid-toolbar-title">
      <span id="game-title" class="game-title" data-game-title>CRABOID</span>
      <span class="craboid-build">BUILD 01 // TEST SECTOR</span>
    </div>
    <div class="game-toolbar-actions">
      <button id="craboid-menu-button" class="game-exit" type="button">MENU</button>
      <button class="game-exit" type="button" data-game-close>EXIT</button>
    </div>
  </div>

  <div id="game-menu" class="game-menu craboid-game-menu" data-game-menu>
    <div class="craboid-menu-shell">
      <div class="craboid-menu-kicker">SECTOR DEFENSE PROTOCOL // 01</div>
      <h2 class="craboid-menu-title">CRABOID</h2>
      <p class="craboid-menu-subtitle">TACTICAL INVASION SIMULATOR</p>

      <div class="craboid-menu-radar" aria-hidden="true">
        <div class="craboid-menu-wave">${menuInvaders}</div>
        <div class="craboid-menu-base craboid-menu-base--one"></div>
        <div class="craboid-menu-base craboid-menu-base--two"></div>
        <div class="craboid-menu-base craboid-menu-base--three"></div>
        <div class="craboid-menu-base craboid-menu-base--four"></div>
        <div class="craboid-menu-ship"></div>
      </div>

      <div class="craboid-menu-specs">
        <span>WAVE 01</span>
        <span>3 LIVES</span>
        <span>4 BASES</span>
      </div>

      <button id="craboid-start" class="full-btn craboid-start" type="button">
        START MISSION
      </button>

      <div class="craboid-menu-help">
        <span><b>&larr; &rarr;</b> MOVE</span>
        <span><b>SPACE</b> FIRE</span>
        <span><b>P</b> PAUSE</span>
        <span><b>ENTER</b> START / RETRY</span>
      </div>
    </div>
  </div>

  <div id="game-stage" class="game-stage craboid-stage hidden" data-game-stage aria-hidden="true">
    <div class="craboid-hud">
      <div class="craboid-hud-cell craboid-hud-score">
        <span class="craboid-hud-label">SCORE</span>
        <span id="craboid-score" class="craboid-hud-value">000000</span>
      </div>
      <div class="craboid-hud-cell">
        <span class="craboid-hud-label">LIVES</span>
        <span id="craboid-lives" class="craboid-hud-value">03</span>
      </div>
      <div class="craboid-hud-cell">
        <span class="craboid-hud-label">WAVE</span>
        <span id="craboid-wave" class="craboid-hud-value">01</span>
      </div>
      <div class="craboid-hud-cell craboid-hud-state">
        <span class="craboid-hud-label">STATUS</span>
        <span id="craboid-status" class="craboid-hud-value" aria-live="polite">READY</span>
      </div>
    </div>

    <div class="craboid-canvas-wrap">
      <canvas
        id="craboid-canvas"
        width="900"
        height="520"
        tabindex="0"
        aria-label="Craboid game field. Use left and right arrows to move, Space to fire, and P to pause."
      ></canvas>
    </div>
  </div>
`;
