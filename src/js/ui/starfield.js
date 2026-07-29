const STAR_LAYERS = [
  { density: 0.000175, min: 90, size: 1, speed: 12.5 },
  { density: 0.00005, min: 30, size: 2, speed: 6 },
  { density: 0.000025, min: 15, size: 3, speed: 4 }
];

export function initStarfield(canvas) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let layers = [];
  let width = 0;
  let height = 0;
  let frameId = null;
  let previousTime = 0;

  function createStars({ density, min, size, speed }) {
    const count = Math.max(min, Math.round(width * height * density));

    return {
      size,
      speed,
      stars: Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height
      }))
    };
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    layers = STAR_LAYERS.map(createStars);
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#fff';

    layers.forEach(({ size, stars }) => {
      stars.forEach((star) => context.fillRect(star.x, star.y, size, size));
    });
  }

  function animate(timestamp) {
    const elapsed = Math.min((timestamp - previousTime) / 1000, 0.1);
    previousTime = timestamp;

    layers.forEach(({ speed, stars }) => {
      stars.forEach((star) => {
        star.y -= speed * elapsed;
        if (star.y < -3) {
          star.y = height + 3;
          star.x = Math.random() * width;
        }
      });
    });

    draw();
    frameId = requestAnimationFrame(animate);
  }

  function start() {
    if (!document.hidden && !reduceMotion.matches && frameId === null) {
      previousTime = performance.now();
      frameId = requestAnimationFrame(animate);
    }
  }

  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reduceMotion.addEventListener('change', () => (reduceMotion.matches ? stop() : start()));
  start();
}
