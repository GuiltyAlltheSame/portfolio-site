let playerScore = 0;
let aiScore = 0;
let pointsScore = 0;

let upPressed = false;
let downPressed = false;
let pongTimer = null;

const DEFAULT_PONG_SETTINGS = {
  playerSpeed: 5,
  aiLerp: 0.05,
  ballSpeedX: 7,
  ballSpeedY: 4,
  hitPoints: 10,
  goalPoints: 100,
  scoreLimit: null
};

const START_COUNTDOWN_MS = 3000;
const GOAL_PAUSE_MS = 1000;
const COUNTDOWN_PIXEL_SIZE = 18;
const COUNTDOWN_PIXEL_GAP = 3;
const GAME_OVER_PIXEL_SIZE = 10;
const GAME_OVER_PIXEL_GAP = 2;
const PIXEL_FONT = {
  ' ': [
    '000',
    '000',
    '000',
    '000',
    '000',
    '000',
    '000'
  ],
  '1': [
    '00100',
    '01100',
    '00100',
    '00100',
    '00100',
    '00100',
    '01110'
  ],
  '2': [
    '11110',
    '00010',
    '00010',
    '11110',
    '10000',
    '10000',
    '11110'
  ],
  '3': [
    '11110',
    '00010',
    '00010',
    '01110',
    '00010',
    '00010',
    '11110'
  ],
  G: [
    '01110',
    '10000',
    '10000',
    '10111',
    '10001',
    '10001',
    '01110'
  ],
  A: [
    '01110',
    '10001',
    '10001',
    '11111',
    '10001',
    '10001',
    '10001'
  ],
  M: [
    '10001',
    '11011',
    '10101',
    '10101',
    '10001',
    '10001',
    '10001'
  ],
  E: [
    '11111',
    '10000',
    '10000',
    '11110',
    '10000',
    '10000',
    '11111'
  ],
  O: [
    '01110',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '01110'
  ],
  V: [
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '01010',
    '00100'
  ],
  R: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10100',
    '10010',
    '10001'
  ]
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
});

export function stopPongGame() {
  if (pongTimer) {
    cancelAnimationFrame(pongTimer);
    pongTimer = null;
  }
}

export function startPongGame(settings = DEFAULT_PONG_SETTINGS) {
  const canvas = document.getElementById('pong-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const scoreHeaderEl = document.getElementById('pong-score-header');
  const matchLabelEl = document.getElementById('pong-match-label');
  const matchScoreEl = document.getElementById('pong-match-score');
  const pointsLabelEl = document.getElementById('pong-points-label');
  const pointsScoreEl = document.getElementById('pong-points-score');

  const paddleWidth = 10;
  const paddleHeight = 80;
  const ballSize = 10;

  let playerY = canvas.height / 2 - paddleHeight / 2;
  let aiY = playerY;

  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballVX = settings.ballSpeedX;
  let ballVY = settings.ballSpeedY;

  const playerSpeed = settings.playerSpeed;
  const aiLerp = settings.aiLerp;
  const hitPoints = settings.hitPoints ?? DEFAULT_PONG_SETTINGS.hitPoints;
  const goalPoints = settings.goalPoints ?? DEFAULT_PONG_SETTINGS.goalPoints;
  const scoreLimit = Number.isFinite(settings.scoreLimit) ? settings.scoreLimit : null;
  const isInfiniteMode = scoreLimit === null;
  let countdownStartedAt = null;
  let goalPauseStartedAt = null;
  let goalPauseDirection = 0;
  let gameOver = false;

  function updateScoreHeader() {
    if (scoreHeaderEl) {
      scoreHeaderEl.classList.toggle('pong-score-header--infinite', isInfiniteMode);
      scoreHeaderEl.classList.toggle('pong-score-header--limit', !isInfiniteMode);
      scoreHeaderEl.classList.toggle('left-leading', !isInfiniteMode && playerScore > aiScore);
      scoreHeaderEl.classList.toggle('right-leading', !isInfiniteMode && aiScore > playerScore);
    }

    if (matchScoreEl) {
      matchScoreEl.textContent = isInfiniteMode ? `${playerScore}:${aiScore}` : playerScore;
    }

    if (matchLabelEl) {
      matchLabelEl.textContent = isInfiniteMode ? 'GAME' : 'YOU';
    }

    if (pointsLabelEl) {
      pointsLabelEl.textContent = isInfiniteMode ? 'SCORE' : 'CPU';
    }

    if (pointsScoreEl) {
      pointsScoreEl.textContent = isInfiniteMode
        ? String(Math.min(pointsScore, 999999)).padStart(6, '0')
        : aiScore;
    }
  }

  function addPoints(points) {
    pointsScore += points;
    updateScoreHeader();
  }

  function resetPaddles() {
    playerY = canvas.height / 2 - paddleHeight / 2;
    aiY = playerY;
  }

  function resetBall({ straight = false } = {}) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVX = (ballVX > 0 ? -1 : 1) * settings.ballSpeedX;
    ballVY = straight
      ? 0
      : (Math.random() * settings.ballSpeedY) - settings.ballSpeedY / 2;
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8AFF3C';
    ctx.fillRect(10, playerY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - 20, aiY, paddleWidth, paddleHeight);
    ctx.fillRect(ballX, ballY, ballSize, ballSize);

    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#8AFF3C';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawPixelText(text, centerX, centerY, pixelSize, pixelGap) {
    const letterGap = pixelSize;
    const letters = [...text].map((char) => PIXEL_FONT[char]).filter(Boolean);
    if (letters.length === 0) return;

    const textWidth = letters.reduce((width, letter, index) => {
      const cols = letter[0].length;
      const letterWidth = cols * pixelSize + (cols - 1) * pixelGap;
      return width + letterWidth + (index < letters.length - 1 ? letterGap : 0);
    }, 0);
    const rows = Math.max(...letters.map((letter) => letter.length));
    const textHeight = rows * pixelSize + (rows - 1) * pixelGap;
    let letterX = centerX - textWidth / 2;
    const startY = centerY - textHeight / 2;

    ctx.fillStyle = '#8AFF3C';

    letters.forEach((letter) => {
      const cols = letter[0].length;
      const letterWidth = cols * pixelSize + (cols - 1) * pixelGap;

      letter.forEach((row, y) => {
        [...row].forEach((cell, x) => {
          if (cell === '1') {
            ctx.fillRect(
              letterX + x * (pixelSize + pixelGap),
              startY + y * (pixelSize + pixelGap),
              pixelSize,
              pixelSize
            );
          }
        });
      });

      letterX += letterWidth + letterGap;
    });
  }

  function drawCountdown(value) {
    drawPixelText(String(value), canvas.width / 2, canvas.height / 2, COUNTDOWN_PIXEL_SIZE, COUNTDOWN_PIXEL_GAP);
  }

  function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPixelText('GAME OVER', canvas.width / 2, canvas.height / 2, GAME_OVER_PIXEL_SIZE, GAME_OVER_PIXEL_GAP);
  }

  function drawGoalPauseOverlay() {
    if (goalPauseDirection === 0) return;

    const halfWidth = canvas.width / 2;
    const overlayX = goalPauseDirection < 0 ? 0 : halfWidth;

    ctx.fillStyle = 'rgba(138, 255, 60, 0.22)';
    ctx.fillRect(overlayX, 0, halfWidth, canvas.height);
  }

  function startGoalPause(timestamp) {
    goalPauseStartedAt = timestamp;
    goalPauseDirection = Math.sign(ballVX);
  }

  function finishGame() {
    gameOver = true;
    goalPauseStartedAt = null;
    goalPauseDirection = 0;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
  }

  function scoreGoal(scoringSide, timestamp) {
    if (scoringSide === 'left') {
      playerScore++;
      pointsScore += goalPoints;
    } else {
      aiScore++;
    }

    updateScoreHeader();

    if (scoreLimit !== null && (playerScore >= scoreLimit || aiScore >= scoreLimit)) {
      finishGame();
      return;
    }

    resetPaddles();
    resetBall({ straight: true });
    startGoalPause(timestamp);
  }

  function update(timestamp) {
    ballX += ballVX;
    ballY += ballVY;

    if (ballY <= 0 || ballY + ballSize >= canvas.height) {
      ballVY *= -1;
    }

    if (ballVX < 0 && ballX <= 20 && ballY + ballSize > playerY && ballY < playerY + paddleHeight) {
      ballVX *= -1;
      const hitPos = (ballY + ballSize / 2) - (playerY + paddleHeight / 2);
      ballVY = hitPos * 0.2 + (Math.random() - 0.5);
      addPoints(hitPoints);
    }

    if (
      ballVX > 0 &&
      ballX + ballSize >= canvas.width - 20 &&
      ballY + ballSize > aiY &&
      ballY < aiY + paddleHeight
    ) {
      ballVX *= -1;
      const hitPos = (ballY + ballSize / 2) - (aiY + paddleHeight / 2);
      ballVY = hitPos * 0.2 + (Math.random() - 0.5);
    }

    aiY += (ballY - aiY - paddleHeight / 2) * aiLerp;

    if (upPressed) playerY -= playerSpeed;
    if (downPressed) playerY += playerSpeed;

    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
    aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));

    if (ballX < 0) {
      scoreGoal('right', timestamp);
      return;
    }

    if (ballX > canvas.width) {
      scoreGoal('left', timestamp);
    }
  }

  function loop(timestamp) {
    if (countdownStartedAt === null) {
      countdownStartedAt = timestamp;
    }

    const countdownElapsed = timestamp - countdownStartedAt;
    const countdownLeft = Math.ceil((START_COUNTDOWN_MS - countdownElapsed) / 1000);
    const goalPauseElapsed = goalPauseStartedAt === null ? 0 : timestamp - goalPauseStartedAt;
    const isGoalPaused = goalPauseStartedAt !== null && goalPauseElapsed < GOAL_PAUSE_MS;

    if (goalPauseStartedAt !== null && !isGoalPaused) {
      goalPauseStartedAt = null;
      goalPauseDirection = 0;
    }

    if (countdownLeft <= 0 && !isGoalPaused && !gameOver) {
      update(timestamp);
    }

    draw();

    if (isGoalPaused) {
      drawGoalPauseOverlay();
    }

    if (countdownLeft > 0 && !gameOver) {
      drawCountdown(countdownLeft);
    }

    if (gameOver) {
      drawGameOver();
    }

    pongTimer = requestAnimationFrame(loop);
  }

  playerScore = 0;
  aiScore = 0;
  pointsScore = 0;
  updateScoreHeader();

  stopPongGame();
  pongTimer = requestAnimationFrame(loop);
}
