let demoTimer = null;
let demoState = null;

const DEMO_BALL_SPEED_X = 4.6;
const DEMO_BALL_SPEED_Y = 3.2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetDemoBall(direction = Math.random() > 0.5 ? 1 : -1) {
  if (!demoState) return;

  const { canvas } = demoState;

  demoState.ballX = canvas.width / 2;
  demoState.ballY = canvas.height / 2;
  demoState.ballVX = direction * DEMO_BALL_SPEED_X;
  demoState.ballVY = (Math.random() * DEMO_BALL_SPEED_Y * 2) - DEMO_BALL_SPEED_Y;
  demoState.fullClear = true;
}

function moveDemoPaddle(currentY, targetCenter, step) {
  if (!demoState) return currentY;

  const { canvas, paddleHeight } = demoState;
  const currentCenter = currentY + paddleHeight / 2;
  const nextY = currentY + (targetCenter - currentCenter) * 0.055 * step;

  return clamp(nextY, 0, canvas.height - paddleHeight);
}

function bounceFromDemoPaddle(paddleY, paddleX, direction, timestamp) {
  if (!demoState) return;

  const { ballSize, paddleWidth, paddleHeight } = demoState;
  const hitPosition = (demoState.ballY + ballSize / 2) - (paddleY + paddleHeight / 2);

  demoState.ballX = direction > 0
    ? paddleX + paddleWidth
    : paddleX - ballSize;
  demoState.ballVX = direction * DEMO_BALL_SPEED_X;
  demoState.ballVY = hitPosition * 0.16 + Math.sin(timestamp * 0.002) * 0.35;
}

function updateDemo(timestamp, step) {
  if (!demoState) return;

  const {
    canvas,
    ballSize,
    paddleWidth,
    paddleHeight,
    leftPaddleX,
    rightPaddleX
  } = demoState;

  const idleCenter = canvas.height / 2;
  const wave = Math.sin(timestamp * 0.0012) * 78;
  const ballCenter = demoState.ballY + ballSize / 2;
  const leftTarget = demoState.ballVX < 0 ? ballCenter : idleCenter + wave;
  const rightTarget = demoState.ballVX > 0 ? ballCenter : idleCenter - wave;

  demoState.leftY = moveDemoPaddle(demoState.leftY, leftTarget, step);
  demoState.rightY = moveDemoPaddle(demoState.rightY, rightTarget, step);

  demoState.ballX += demoState.ballVX * step;
  demoState.ballY += demoState.ballVY * step;

  if (demoState.ballY <= 0) {
    demoState.ballY = 0;
    demoState.ballVY = Math.abs(demoState.ballVY);
  }

  if (demoState.ballY + ballSize >= canvas.height) {
    demoState.ballY = canvas.height - ballSize;
    demoState.ballVY = -Math.abs(demoState.ballVY);
  }

  const overlapsLeftPaddle =
    demoState.ballVX < 0 &&
    demoState.ballX <= leftPaddleX + paddleWidth &&
    demoState.ballX + ballSize >= leftPaddleX &&
    demoState.ballY + ballSize > demoState.leftY &&
    demoState.ballY < demoState.leftY + paddleHeight;

  if (overlapsLeftPaddle) {
    bounceFromDemoPaddle(demoState.leftY, leftPaddleX, 1, timestamp);
  }

  const overlapsRightPaddle =
    demoState.ballVX > 0 &&
    demoState.ballX + ballSize >= rightPaddleX &&
    demoState.ballX <= rightPaddleX + paddleWidth &&
    demoState.ballY + ballSize > demoState.rightY &&
    demoState.ballY < demoState.rightY + paddleHeight;

  if (overlapsRightPaddle) {
    bounceFromDemoPaddle(demoState.rightY, rightPaddleX, -1, timestamp);
  }

  if (demoState.ballX + ballSize < -30) {
    resetDemoBall(1);
  }

  if (demoState.ballX > canvas.width + 30) {
    resetDemoBall(-1);
  }
}

function drawDemo() {
  if (!demoState) return;

  const {
    canvas,
    ctx,
    ballSize,
    paddleWidth,
    paddleHeight,
    leftPaddleX,
    rightPaddleX
  } = demoState;

  ctx.save();
  ctx.fillStyle = demoState.fullClear ? '#000' : 'rgba(0, 0, 0, 0.34)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  demoState.fullClear = false;

  ctx.fillStyle = '#8AFF3C';
  ctx.globalAlpha = 0.58;
  ctx.fillRect(leftPaddleX, demoState.leftY, paddleWidth, paddleHeight);
  ctx.fillRect(rightPaddleX, demoState.rightY, paddleWidth, paddleHeight);
  ctx.fillRect(demoState.ballX, demoState.ballY, ballSize, ballSize);
  ctx.restore();
}

function loopDemo(timestamp) {
  if (!demoState) return;

  if (demoState.lastTimestamp === null) {
    demoState.lastTimestamp = timestamp;
  }

  const elapsed = timestamp - demoState.lastTimestamp;
  const step = clamp(elapsed / 16.67, 0.25, 2);

  demoState.lastTimestamp = timestamp;
  updateDemo(timestamp, step);
  drawDemo();

  demoTimer = requestAnimationFrame(loopDemo);
}

export function startPBallDemo() {
  if (demoTimer) return;

  const canvas = document.getElementById('pball-demo-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const paddleHeight = 88;

  demoState = {
    canvas,
    ctx,
    paddleWidth: 12,
    paddleHeight,
    ballSize: 10,
    leftPaddleX: 54,
    rightPaddleX: canvas.width - 66,
    leftY: canvas.height / 2 - paddleHeight / 2,
    rightY: canvas.height / 2 - paddleHeight / 2,
    ballX: canvas.width / 2,
    ballY: canvas.height / 2,
    ballVX: DEMO_BALL_SPEED_X,
    ballVY: DEMO_BALL_SPEED_Y,
    lastTimestamp: null,
    fullClear: true
  };

  resetDemoBall();
  drawDemo();
  demoTimer = requestAnimationFrame(loopDemo);
}

export function stopPBallDemo() {
  if (demoTimer) {
    cancelAnimationFrame(demoTimer);
    demoTimer = null;
  }

  demoState = null;
}
