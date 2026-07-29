const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;
const PLAYER_WIDTH = 38;
const PLAYER_HEIGHT = 25;
const PLAYER_SPEED = 315;
const PLAYER_Y = CANVAS_HEIGHT - 42;
const PLAYER_BULLET_SIZE = 7;
const PLAYER_BULLET_SPEED = 520;
const PLAYER_FIRE_COOLDOWN_MS = 360;
const ENEMY_ROWS = 5;
const ENEMY_COLUMNS = 10;
const ENEMY_SIZE = 26;
const ENEMY_GAP_X = 16;
const ENEMY_GAP_Y = 12;
const ENEMY_STEP_X = 12;
const ENEMY_STEP_Y = 18;
const ENEMY_BULLET_SIZE = 7;
const ENEMY_BULLET_SPEED = 178;
const COUNTDOWN_MS = 3000;
const PLAYER_HIT_PAUSE_MS = 900;
const PLAYER_INVULNERABLE_MS = 1200;
const WAVE_CLEAR_MS = 1000;
const BASE_BLOCK_SIZE = 8;
const BASE_COLUMNS = 11;
const BASE_ROWS = 6;
const BASE_Y = 382;
const BASE_CENTERS = [150, 350, 550, 750];
const FIELD_MARGIN = 24;
const MAX_FRAME_DELTA_SECONDS = 0.05;

const ENEMY_ROW_POINTS = [30, 20, 20, 10, 10];
const CONTROL_KEYS = new Set(['ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'p', 'P', 'Enter', 'Escape']);

let activeSession = null;

function rectanglesOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function createStars() {
  let seed = 74123;

  return Array.from({ length: 82 }, (_, index) => {
    seed = (seed * 16807) % 2147483647;
    const x = seed % CANVAS_WIDTH;
    seed = (seed * 16807) % 2147483647;
    const y = seed % CANVAS_HEIGHT;

    return {
      x,
      y,
      size: index % 11 === 0 ? 2 : 1,
      alpha: 0.18 + (index % 5) * 0.08
    };
  });
}

function createEnemies() {
  const enemies = [];

  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let column = 0; column < ENEMY_COLUMNS; column++) {
      enemies.push({
        row,
        column,
        localX: column * (ENEMY_SIZE + ENEMY_GAP_X),
        localY: row * (ENEMY_SIZE + ENEMY_GAP_Y),
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
        alive: true
      });
    }
  }

  return enemies;
}

function createBaseBlocks() {
  const blocks = [];

  BASE_CENTERS.forEach((centerX, baseIndex) => {
    const baseWidth = BASE_COLUMNS * BASE_BLOCK_SIZE;
    const startX = Math.round(centerX - baseWidth / 2);

    for (let row = 0; row < BASE_ROWS; row++) {
      for (let column = 0; column < BASE_COLUMNS; column++) {
        const isTopCorner = row === 0 && (column < 2 || column > BASE_COLUMNS - 3);
        const isBottomCorner = row === BASE_ROWS - 1 && (column === 0 || column === BASE_COLUMNS - 1);
        const isDoorway = row >= 3 && column >= 4 && column <= 6;

        if (isTopCorner || isBottomCorner || isDoorway) {
          continue;
        }

        blocks.push({
          baseIndex,
          x: startX + column * BASE_BLOCK_SIZE,
          y: BASE_Y + row * BASE_BLOCK_SIZE,
          width: BASE_BLOCK_SIZE,
          height: BASE_BLOCK_SIZE,
          alive: true
        });
      }
    }
  });

  return blocks;
}

function createCraboidSession({ canvas, onRequestMenu }) {
  const ctx = canvas.getContext('2d');
  const skillsPanel = document.getElementById('skills');
  const scoreEl = document.getElementById('craboid-score');
  const livesEl = document.getElementById('craboid-lives');
  const waveEl = document.getElementById('craboid-wave');
  const statusEl = document.getElementById('craboid-status');
  const keys = new Set();
  const stars = createStars();

  let animationFrameId = null;
  let running = false;
  let lastTimestamp = null;
  let state = 'countdown';
  let stateEndsAt = 0;
  let pauseStartedAt = 0;
  let pausedState = null;
  let score = 0;
  let lives = 3;
  let wave = 1;
  let player = null;
  let enemies = [];
  let baseBlocks = [];
  let playerBullets = [];
  let enemyBullets = [];
  let flashes = [];
  let formation = null;
  let lastPlayerShotAt = -Infinity;
  let nextEnemyShotAt = 0;
  let gameOverTitle = 'GAME OVER';
  let skillsObserver = null;

  function isInteractiveTarget(target) {
    return target instanceof Element && Boolean(
      target.closest('button, a, input, textarea, select, [contenteditable="true"]')
    );
  }

  function getEnemyRect(enemy) {
    return {
      x: formation.x + enemy.localX,
      y: formation.y + enemy.localY,
      width: enemy.width,
      height: enemy.height
    };
  }

  function updateHud() {
    if (scoreEl) {
      scoreEl.textContent = String(Math.min(score, 999999)).padStart(6, '0');
    }

    if (livesEl) {
      livesEl.textContent = String(Math.max(lives, 0)).padStart(2, '0');
    }

    if (waveEl) {
      waveEl.textContent = String(Math.min(wave, 99)).padStart(2, '0');
    }

    if (statusEl) {
      const statusLabels = {
        countdown: 'READY',
        playing: 'ACTIVE',
        paused: 'PAUSED',
        hit: 'SHIP LOST',
        waveClear: 'CLEAR',
        gameOver: 'OFFLINE'
      };

      statusEl.textContent = statusLabels[state] || 'STANDBY';
    }
  }

  function resetPlayer() {
    player = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: PLAYER_Y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      invulnerableUntil: 0
    };
  }

  function resetWave(timestamp, { resetBases = true } = {}) {
    const formationWidth = ENEMY_COLUMNS * ENEMY_SIZE + (ENEMY_COLUMNS - 1) * ENEMY_GAP_X;

    enemies = createEnemies();
    formation = {
      x: Math.round((CANVAS_WIDTH - formationWidth) / 2),
      y: 50,
      direction: 1,
      accumulatorMs: 0,
      frame: 0
    };

    if (resetBases) {
      baseBlocks = createBaseBlocks();
    }

    playerBullets = [];
    enemyBullets = [];
    flashes = [];
    lastPlayerShotAt = -Infinity;
    nextEnemyShotAt = timestamp + 1050;
    resetPlayer();
    state = 'countdown';
    stateEndsAt = timestamp + COUNTDOWN_MS;
    updateHud();
  }

  function resetCampaign(timestamp) {
    score = 0;
    lives = 3;
    wave = 1;
    gameOverTitle = 'GAME OVER';
    resetWave(timestamp);
  }

  function addFlash(x, y, color = '#d8ffbe') {
    flashes.push({
      x,
      y,
      color,
      age: 0,
      duration: 0.18
    });
  }

  function firePlayerShot(timestamp) {
    if (
      playerBullets.length > 0 ||
      timestamp - lastPlayerShotAt < PLAYER_FIRE_COOLDOWN_MS
    ) {
      return;
    }

    playerBullets.push({
      x: player.x + player.width / 2 - PLAYER_BULLET_SIZE / 2,
      y: player.y - PLAYER_BULLET_SIZE - 3,
      width: PLAYER_BULLET_SIZE,
      height: PLAYER_BULLET_SIZE,
      velocityY: -PLAYER_BULLET_SPEED
    });

    lastPlayerShotAt = timestamp;
  }

  function getBottomShooters() {
    const shooters = [];

    for (let column = 0; column < ENEMY_COLUMNS; column++) {
      const columnEnemies = enemies
        .filter((enemy) => enemy.alive && enemy.column === column)
        .sort((a, b) => b.row - a.row);

      if (columnEnemies[0]) {
        shooters.push(columnEnemies[0]);
      }
    }

    return shooters;
  }

  function fireEnemyShot(timestamp) {
    const maxShots = Math.min(5, 2 + Math.ceil(wave / 2));

    if (timestamp < nextEnemyShotAt) {
      return;
    }

    const waveDelayReduction = Math.min(280, (wave - 1) * 35);
    nextEnemyShotAt = timestamp + 850 + Math.random() * 520 - waveDelayReduction;

    if (enemyBullets.length >= maxShots) {
      return;
    }

    const shooters = getBottomShooters();

    if (shooters.length === 0) {
      return;
    }

    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    const rect = getEnemyRect(shooter);

    enemyBullets.push({
      x: rect.x + rect.width / 2 - ENEMY_BULLET_SIZE / 2,
      y: rect.y + rect.height + 4,
      width: ENEMY_BULLET_SIZE,
      height: ENEMY_BULLET_SIZE,
      velocityY: ENEMY_BULLET_SPEED + (wave - 1) * 10
    });
  }

  function getEnemyTickInterval() {
    const aliveCount = enemies.filter((enemy) => enemy.alive).length;
    const waveBase = Math.max(360, 520 - (wave - 1) * 32);
    const aliveRatio = aliveCount / (ENEMY_ROWS * ENEMY_COLUMNS);

    return Math.max(110, 110 + (waveBase - 110) * aliveRatio);
  }

  function damageBasesFromInvaders() {
    const aliveEnemies = enemies.filter((enemy) => enemy.alive);

    baseBlocks.forEach((block) => {
      if (!block.alive) {
        return;
      }

      const collidingEnemy = aliveEnemies.find((enemy) => rectanglesOverlap(getEnemyRect(enemy), block));

      if (collidingEnemy) {
        block.alive = false;
        addFlash(block.x + block.width / 2, block.y + block.height / 2, '#8aff3c');
      }
    });
  }

  function finishGame(title) {
    state = 'gameOver';
    gameOverTitle = title;
    playerBullets = [];
    keys.clear();
    updateHud();
  }

  function checkInvaderBreach() {
    const breached = enemies
      .filter((enemy) => enemy.alive)
      .some((enemy) => {
        const rect = getEnemyRect(enemy);
        return rect.y + rect.height >= player.y || rectanglesOverlap(rect, player);
      });

    if (breached) {
      lives = 0;
      finishGame('SECTOR LOST');
    }
  }

  function stepFormation() {
    const aliveEnemies = enemies.filter((enemy) => enemy.alive);

    if (aliveEnemies.length === 0) {
      return;
    }

    const left = Math.min(...aliveEnemies.map((enemy) => getEnemyRect(enemy).x));
    const right = Math.max(...aliveEnemies.map((enemy) => getEnemyRect(enemy).x + enemy.width));
    const nextX = formation.direction * ENEMY_STEP_X;

    if (left + nextX <= FIELD_MARGIN || right + nextX >= CANVAS_WIDTH - FIELD_MARGIN) {
      formation.direction *= -1;
      formation.y += ENEMY_STEP_Y;
    } else {
      formation.x += nextX;
    }

    formation.frame = formation.frame === 0 ? 1 : 0;
    damageBasesFromInvaders();
    checkInvaderBreach();
  }

  function getNearestCollision(projectile, candidates) {
    const direction = Math.sign(projectile.velocityY);
    const collidingCandidates = candidates.filter((candidate) => (
      rectanglesOverlap(projectile, candidate.rect)
    ));

    return collidingCandidates.sort((a, b) => {
      const aEdge = direction < 0
        ? a.rect.y + a.rect.height
        : a.rect.y;
      const bEdge = direction < 0
        ? b.rect.y + b.rect.height
        : b.rect.y;

      return direction < 0 ? bEdge - aEdge : aEdge - bEdge;
    })[0] || null;
  }

  function destroyBlock(block) {
    block.alive = false;
    addFlash(block.x + block.width / 2, block.y + block.height / 2, '#8aff3c');
  }

  function destroyBlockHitBy(projectile) {
    const collision = getNearestCollision(
      projectile,
      baseBlocks
        .filter((block) => block.alive)
        .map((block) => ({ entity: block, rect: block }))
    );

    if (!collision) {
      return false;
    }

    destroyBlock(collision.entity);
    return true;
  }

  function createProjectileSweep(projectile, previousY) {
    return {
      x: projectile.x,
      y: Math.min(previousY, projectile.y),
      width: projectile.width,
      height: Math.abs(projectile.y - previousY) + projectile.height,
      velocityY: projectile.velocityY
    };
  }

  function updatePlayerBullets(deltaSeconds, timestamp) {
    for (let index = playerBullets.length - 1; index >= 0; index--) {
      const bullet = playerBullets[index];
      const previousY = bullet.y;
      bullet.y += bullet.velocityY * deltaSeconds;
      const bulletSweep = createProjectileSweep(bullet, previousY);

      if (bullet.y + bullet.height < 0) {
        playerBullets.splice(index, 1);
        continue;
      }

      const collision = getNearestCollision(bulletSweep, [
        ...baseBlocks
          .filter((block) => block.alive)
          .map((block) => ({
            type: 'base',
            entity: block,
            rect: block
          })),
        ...enemies
          .filter((enemy) => enemy.alive)
          .map((enemy) => ({
            type: 'enemy',
            entity: enemy,
            rect: getEnemyRect(enemy)
          }))
      ]);

      if (!collision) {
        continue;
      }

      playerBullets.splice(index, 1);

      if (collision.type === 'base') {
        destroyBlock(collision.entity);
        continue;
      }

      const hitEnemy = collision.entity;
      const hitRect = getEnemyRect(hitEnemy);
      hitEnemy.alive = false;
      score += ENEMY_ROW_POINTS[hitEnemy.row];
      addFlash(hitRect.x + hitRect.width / 2, hitRect.y + hitRect.height / 2);
      updateHud();

      if (!enemies.some((enemy) => enemy.alive)) {
        score += wave * 100;
        state = 'waveClear';
        stateEndsAt = timestamp + WAVE_CLEAR_MS;
        enemyBullets = [];
        updateHud();
        return;
      }
    }
  }

  function hitPlayer(timestamp, bullet) {
    if (timestamp < player.invulnerableUntil) {
      return;
    }

    lives -= 1;
    addFlash(
      bullet.x + bullet.width / 2,
      bullet.y + bullet.height / 2,
      '#ff6b57'
    );
    enemyBullets = [];
    playerBullets = [];
    resetPlayer();
    keys.clear();

    if (lives <= 0) {
      finishGame('GAME OVER');
      return;
    }

    state = 'hit';
    stateEndsAt = timestamp + PLAYER_HIT_PAUSE_MS;
    player.invulnerableUntil = stateEndsAt + PLAYER_INVULNERABLE_MS;
    updateHud();
  }

  function updateEnemyBullets(deltaSeconds, timestamp) {
    for (let index = enemyBullets.length - 1; index >= 0; index--) {
      const bullet = enemyBullets[index];
      const previousY = bullet.y;
      bullet.y += bullet.velocityY * deltaSeconds;
      const bulletSweep = createProjectileSweep(bullet, previousY);

      if (bullet.y > CANVAS_HEIGHT) {
        enemyBullets.splice(index, 1);
        continue;
      }

      if (destroyBlockHitBy(bulletSweep)) {
        enemyBullets.splice(index, 1);
        continue;
      }

      if (rectanglesOverlap(bulletSweep, player)) {
        enemyBullets.splice(index, 1);
        hitPlayer(timestamp, bullet);
        return;
      }
    }
  }

  function updateFlashes(deltaSeconds) {
    flashes.forEach((flash) => {
      flash.age += deltaSeconds;
    });

    flashes = flashes.filter((flash) => flash.age < flash.duration);
  }

  function updatePlaying(deltaSeconds, timestamp) {
    const movement = (
      (keys.has('ArrowRight') ? 1 : 0) -
      (keys.has('ArrowLeft') ? 1 : 0)
    ) * PLAYER_SPEED * deltaSeconds;

    player.x = Math.max(
      FIELD_MARGIN,
      Math.min(CANVAS_WIDTH - FIELD_MARGIN - player.width, player.x + movement)
    );

    if (keys.has('fire')) {
      firePlayerShot(timestamp);
    }

    formation.accumulatorMs += deltaSeconds * 1000;
    const tickInterval = getEnemyTickInterval();

    while (formation.accumulatorMs >= tickInterval && state === 'playing') {
      formation.accumulatorMs -= tickInterval;
      stepFormation();
    }

    if (state !== 'playing') {
      return;
    }

    fireEnemyShot(timestamp);
    updatePlayerBullets(deltaSeconds, timestamp);

    if (state !== 'playing') {
      return;
    }

    updateEnemyBullets(deltaSeconds, timestamp);
    updateFlashes(deltaSeconds);
  }

  function drawBackground(timestamp) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    stars.forEach((star, index) => {
      const shimmer = 0.7 + Math.sin(timestamp * 0.002 + index) * 0.3;
      ctx.globalAlpha = star.alpha * shimmer;
      ctx.fillStyle = '#c4ff8f';
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(138, 255, 60, 0.055)';
    ctx.lineWidth = 1;

    for (let y = 40; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(CANVAS_WIDTH, y + 0.5);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(138, 255, 60, 0.24)';
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(FIELD_MARGIN, PLAYER_Y + PLAYER_HEIGHT + 8);
    ctx.lineTo(CANVAS_WIDTH - FIELD_MARGIN, PLAYER_Y + PLAYER_HEIGHT + 8);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawEnemies() {
    ctx.save();
    ctx.shadowColor = '#8aff3c';
    ctx.shadowBlur = 7;

    enemies.forEach((enemy) => {
      if (!enemy.alive) {
        return;
      }

      const rect = getEnemyRect(enemy);
      const insetOffset = formation.frame === 0 ? 4 : 6;

      ctx.fillStyle = 'rgba(138, 255, 60, 0.12)';
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeStyle = '#8aff3c';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2);
      ctx.fillStyle = '#8aff3c';
      ctx.fillRect(rect.x + insetOffset, rect.y + 6, 4, 4);
      ctx.fillRect(rect.x + rect.width - insetOffset - 4, rect.y + 6, 4, 4);
      ctx.fillRect(rect.x + 7, rect.y + rect.height - 7, rect.width - 14, 3);
    });

    ctx.restore();
  }

  function drawBases() {
    ctx.save();
    ctx.fillStyle = '#8aff3c';
    ctx.shadowColor = '#8aff3c';
    ctx.shadowBlur = 4;

    baseBlocks.forEach((block) => {
      if (!block.alive) {
        return;
      }

      ctx.fillRect(block.x + 0.5, block.y + 0.5, block.width - 1, block.height - 1);
    });

    ctx.restore();
  }

  function drawPlayer(timestamp) {
    if (lives <= 0) {
      return;
    }

    if (
      timestamp < player.invulnerableUntil &&
      Math.floor(timestamp / 90) % 2 === 0
    ) {
      return;
    }

    ctx.save();
    ctx.fillStyle = '#d8ffbe';
    ctx.strokeStyle = '#8aff3c';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#8aff3c';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width * 0.62, player.y + player.height * 0.78);
    ctx.lineTo(player.x + player.width * 0.5, player.y + player.height);
    ctx.lineTo(player.x + player.width * 0.38, player.y + player.height * 0.78);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawProjectiles() {
    ctx.save();
    ctx.shadowBlur = 8;

    ctx.fillStyle = '#d8ffbe';
    ctx.shadowColor = '#8aff3c';
    playerBullets.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    ctx.fillStyle = '#ff6b57';
    ctx.shadowColor = '#ff6b57';
    enemyBullets.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    ctx.restore();
  }

  function drawFlashes() {
    flashes.forEach((flash) => {
      const progress = flash.age / flash.duration;
      const size = 8 + progress * 28;

      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = flash.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = flash.color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(flash.x - size / 2, flash.y - size / 2, size, size);
      ctx.restore();
    });
  }

  function drawCenteredText(text, y, size, color = '#8aff3c') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px "Ac437ApricotPortable", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(text, CANVAS_WIDTH / 2, y);
    ctx.restore();
  }

  function drawOverlay(timestamp) {
    let title = '';
    let subtitle = '';

    if (state === 'countdown') {
      const count = Math.max(1, Math.ceil((stateEndsAt - timestamp) / 1000));
      title = String(count);
      subtitle = `WAVE ${String(wave).padStart(2, '0')}`;
    } else if (state === 'paused') {
      title = 'PAUSED';
      subtitle = 'PRESS P TO RESUME';
    } else if (state === 'hit') {
      title = 'SHIP LOST';
      subtitle = `${lives} ${lives === 1 ? 'LIFE' : 'LIVES'} REMAIN`;
    } else if (state === 'waveClear') {
      title = 'WAVE CLEAR';
      subtitle = `SCORE ${String(score).padStart(6, '0')}`;
    } else if (state === 'gameOver') {
      title = gameOverTitle;
      subtitle = `SCORE ${String(score).padStart(6, '0')} // ENTER TO RETRY`;
    }

    if (!title) {
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.66)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawCenteredText(title, CANVAS_HEIGHT / 2 - 18, state === 'countdown' ? 72 : 48);
    drawCenteredText(subtitle, CANVAS_HEIGHT / 2 + 40, 20, '#c4ff8f');
  }

  function draw(timestamp) {
    drawBackground(timestamp);
    drawBases();
    drawEnemies();
    drawProjectiles();
    drawPlayer(timestamp);
    drawFlashes();
    drawOverlay(timestamp);
  }

  function pauseGame(timestamp) {
    const pausableStates = new Set(['countdown', 'playing', 'hit', 'waveClear']);

    if (!pausableStates.has(state)) {
      return;
    }

    pausedState = state;
    state = 'paused';
    pauseStartedAt = timestamp;
    keys.clear();
    updateHud();
  }

  function resumeGame(timestamp) {
    if (state !== 'paused') {
      return;
    }

    const pausedFor = timestamp - pauseStartedAt;

    if (pausedState !== 'playing') {
      stateEndsAt += pausedFor;
    }

    nextEnemyShotAt += pausedFor;
    lastPlayerShotAt += pausedFor;
    player.invulnerableUntil += pausedFor;
    state = pausedState || 'playing';
    pausedState = null;
    lastTimestamp = timestamp;
    updateHud();
  }

  function togglePause(timestamp) {
    if (state === 'paused') {
      resumeGame(timestamp);
    } else {
      pauseGame(timestamp);
    }
  }

  function handleSkillsVisibility() {
    if (
      running &&
      skillsPanel &&
      !skillsPanel.classList.contains('active') &&
      typeof onRequestMenu === 'function'
    ) {
      onRequestMenu();
    }
  }

  function handleKeydown(event) {
    if (
      !CONTROL_KEYS.has(event.key) ||
      isInteractiveTarget(event.target) ||
      (skillsPanel && !skillsPanel.classList.contains('active'))
    ) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Escape' && !event.repeat) {
      if (typeof onRequestMenu === 'function') {
        onRequestMenu();
      }
      return;
    }

    if ((event.key === 'p' || event.key === 'P') && !event.repeat) {
      togglePause(performance.now());
      return;
    }

    if (event.key === 'Enter' && state === 'gameOver' && !event.repeat) {
      resetCampaign(performance.now());
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      keys.add(event.key);
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      keys.add('fire');
    }
  }

  function handleKeyup(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      keys.delete(event.key);
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      keys.delete('fire');
    }
  }

  function handleBlur() {
    keys.clear();
    pauseGame(performance.now());
  }

  /*
   * The listeners below deliberately stay on document/window while a session is
   * active so held keys are always released. Interactive controls are excluded
   * in handleKeydown, and the session is stopped when the Skills tab is hidden.
   */
  function bindSessionEvents() {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
    window.addEventListener('blur', handleBlur);

    if (skillsPanel) {
      skillsObserver = new MutationObserver(handleSkillsVisibility);
      skillsObserver.observe(skillsPanel, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  function unbindSessionEvents() {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', handleKeyup);
    window.removeEventListener('blur', handleBlur);

    if (skillsObserver) {
      skillsObserver.disconnect();
      skillsObserver = null;
    }
  }

  function loop(timestamp) {
    if (!running) {
      return;
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const deltaSeconds = Math.min(
      (timestamp - lastTimestamp) / 1000,
      MAX_FRAME_DELTA_SECONDS
    );
    lastTimestamp = timestamp;

    if (state === 'countdown' && timestamp >= stateEndsAt) {
      state = 'playing';
      nextEnemyShotAt = Math.max(nextEnemyShotAt, timestamp + 500);
      updateHud();
    } else if (state === 'hit' && timestamp >= stateEndsAt) {
      state = 'playing';
      updateHud();
    } else if (state === 'waveClear' && timestamp >= stateEndsAt) {
      wave += 1;
      resetWave(timestamp);
    }

    if (state === 'playing') {
      updatePlaying(deltaSeconds, timestamp);
    } else {
      updateFlashes(deltaSeconds);
    }

    draw(timestamp);
    animationFrameId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) {
      return;
    }

    running = true;
    bindSessionEvents();
    resetCampaign(performance.now());
    canvas.focus({ preventScroll: true });
    animationFrameId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    keys.clear();
    unbindSessionEvents();

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  return {
    start,
    stop
  };
}

export function stopCraboidGame() {
  if (activeSession) {
    activeSession.stop();
    activeSession = null;
  }
}

export function startCraboidGame({ onRequestMenu } = {}) {
  const canvas = document.getElementById('craboid-canvas');

  if (!canvas) {
    return null;
  }

  stopCraboidGame();
  activeSession = createCraboidSession({
    canvas,
    onRequestMenu
  });
  activeSession.start();

  return activeSession;
}
