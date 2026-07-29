export const pballTemplate = `

      <div class="game-toolbar">
        <span id="game-title" class="game-title" data-game-title>P-BALL</span>
        <div class="game-toolbar-actions">
          <button id="pball-reset" class="game-exit" type="button">RESET</button>
          <button class="game-exit" type="button" data-game-close>EXIT</button>
        </div>
      </div>

      <div id="game-menu" class="game-menu" data-game-menu>
        <canvas id="pball-demo-canvas" class="pball-demo-canvas" width="900" height="520" aria-hidden="true"></canvas>
        <canvas class="pball-menu-cover" width="900" height="520" aria-hidden="true"></canvas>

        <div class="pball-menu">

          <div class="pball-menu-title">P-BALL / SYSTEM MENU</div>

          <div class="pball-menu-row">
            <span>DIFFICULTY</span>

            <div id="pball-difficulty" class="pball-radio-group">
              <label class="pball-radio">
                <input type="radio" name="pballDifficulty" value="easy">
                <span>EASY</span>
              </label>

              <label class="pball-radio">
                <input type="radio" name="pballDifficulty" value="normal" checked>
                <span>NORMAL</span>
              </label>

              <label class="pball-radio">
                <input type="radio" name="pballDifficulty" value="hard">
                <span>HARD</span>
              </label>

              <label class="pball-radio">
                <input type="radio" name="pballDifficulty" value="insane">
                <span>INSANE</span>
              </label>
            </div>
          </div>

          <div class="pball-menu-row">
            <span>MATCH</span>
            <div id="pball-score-limit" class="pball-radio-group" role="radiogroup" aria-label="Match score limit">
              <label class="pball-radio">
                <input type="radio" name="pballScoreLimit" value="10">
                <span>10:0</span>
              </label>

              <label class="pball-radio">
                <input type="radio" name="pballScoreLimit" value="30">
                <span>30:0</span>
              </label>

              <label class="pball-radio">
                <input type="radio" name="pballScoreLimit" value="50">
                <span>50:0</span>
              </label>

              <label class="pball-radio">
                <input type="radio" name="pballScoreLimit" value="infinity" checked>
                <span>INF</span>
              </label>
            </div>
          </div>

          <button id="pball-start" class="full-btn" type="button">START GAME</button>

          <div class="pball-menu-help">
            UP / DOWN - MOVE<br>
            SPACE - PAUSE<br>
            RESET - BACK TO MENU
          </div>

        </div>
      </div>

      <div id="game-stage" class="game-stage hidden" data-game-stage aria-hidden="true">
        <div id="pball-score-header" class="pball-score-header">
          <div class="pball-match-score">
            <span id="pball-match-label" class="pball-score-label">GAME</span>
            <span id="pball-match-score" class="pball-score-value">0:0</span>
          </div>
          <div class="pball-points-score">
            <span id="pball-points-label" class="pball-score-label">SCORE</span>
            <span id="pball-points-score" class="pball-score-value">000000</span>
          </div>
        </div>
        <canvas id="pball-canvas" width="900" height="520"></canvas>
      </div>
`;
