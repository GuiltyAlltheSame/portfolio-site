export const pongTemplate = `

      <div class="game-toolbar">
        <span id="game-title" class="game-title" data-game-title>P-BALL</span>
        <div class="game-toolbar-actions">
          <button id="pong-reset" class="game-exit" type="button">RESET</button>
          <button class="game-exit" type="button" data-game-close>EXIT</button>
        </div>
      </div>

      <div id="game-menu" class="game-menu" data-game-menu>
        <canvas id="pong-demo-canvas" class="pong-demo-canvas" width="900" height="520" aria-hidden="true"></canvas>
        <canvas class="pong-menu-cover" width="900" height="520" aria-hidden="true"></canvas>

        <div class="pong-menu">

          <div class="pong-menu-title">P-BALL / SYSTEM MENU</div>

          <div class="pong-menu-row">
            <span>DIFFICULTY</span>

            <div id="pong-difficulty" class="pong-radio-group">
              <label class="pong-radio">
                <input type="radio" name="pongDifficulty" value="easy">
                <span>EASY</span>
              </label>

              <label class="pong-radio">
                <input type="radio" name="pongDifficulty" value="normal" checked>
                <span>NORMAL</span>
              </label>

              <label class="pong-radio">
                <input type="radio" name="pongDifficulty" value="hard">
                <span>HARD</span>
              </label>

              <label class="pong-radio">
                <input type="radio" name="pongDifficulty" value="insane">
                <span>INSANE</span>
              </label>
            </div>
          </div>

          <div class="pong-menu-row">
            <span>MATCH</span>
            <div id="pong-score-limit" class="pong-radio-group" role="radiogroup" aria-label="Match score limit">
              <label class="pong-radio">
                <input type="radio" name="pongScoreLimit" value="10">
                <span>10:0</span>
              </label>

              <label class="pong-radio">
                <input type="radio" name="pongScoreLimit" value="30">
                <span>30:0</span>
              </label>

              <label class="pong-radio">
                <input type="radio" name="pongScoreLimit" value="50">
                <span>50:0</span>
              </label>

              <label class="pong-radio">
                <input type="radio" name="pongScoreLimit" value="infinity" checked>
                <span>INF</span>
              </label>
            </div>
          </div>

          <button id="pong-start" class="full-btn" type="button">START GAME</button>

          <div class="pong-menu-help">
            UP / DOWN - MOVE<br>
            SPACE - PAUSE<br>
            RESET - BACK TO MENU
          </div>

        </div>
      </div>

      <div id="game-stage" class="game-stage hidden" data-game-stage aria-hidden="true">
        <div id="pong-score-header" class="pong-score-header">
          <div class="pong-match-score">
            <span id="pong-match-label" class="pong-score-label">GAME</span>
            <span id="pong-match-score" class="pong-score-value">0:0</span>
          </div>
          <div class="pong-points-score">
            <span id="pong-points-label" class="pong-score-label">SCORE</span>
            <span id="pong-points-score" class="pong-score-value">000000</span>
          </div>
        </div>
        <canvas id="pong-canvas" width="900" height="520"></canvas>
      </div>
`;
