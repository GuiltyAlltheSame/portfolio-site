let playerScore = 0;
let aiScore = 0;

let upPressed = false;
let downPressed = false;
let pongTimer = null;

const DEFAULT_PONG_SETTINGS = {
  playerSpeed: 5,
  aiLerp: 0.05,
  ballSpeedX: 7,
  ballSpeedY: 4
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

  function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVX = (ballVX > 0 ? -1 : 1) * settings.ballSpeedX;
    ballVY = (Math.random() * settings.ballSpeedY) - settings.ballSpeedY / 2;
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8AFF3C';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${playerScore}  ${aiScore}`, canvas.width / 2, 30);

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

  function update() {
    ballX += ballVX;
    ballY += ballVY;

    if (ballY <= 0 || ballY + ballSize >= canvas.height) {
      ballVY *= -1;
    }

    if (ballX <= 20 && ballY + ballSize > playerY && ballY < playerY + paddleHeight) {
      ballVX *= -1;
      const hitPos = (ballY + ballSize / 2) - (playerY + paddleHeight / 2);
      ballVY = hitPos * 0.2 + (Math.random() - 0.5);
    }

    if (
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
      aiScore++;
      resetBall();
    }

    if (ballX > canvas.width) {
      playerScore++;
      resetBall();
    }
  }

  function loop() {
    update();
    draw();
    pongTimer = requestAnimationFrame(loop);
  }

  playerScore = 0;
  aiScore = 0;

  stopPongGame();
  loop();
}