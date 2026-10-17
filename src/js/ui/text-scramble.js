const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}*+=-';

export function initTextScramble() {
  const target = document.querySelector('#contact .little-about');
  if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const original = target.textContent.replace(/\s+/g, ' ').trim();
  target.textContent = '';
  const characters = [...original].map((character) => {
    const span = document.createElement('span');
    span.textContent = character;
    span.className = 'scramble-character';
    target.append(span);
    return span;
  });

  let active = new Set();
  let timer = null;

  function restore() {
    active.forEach((span) => { span.textContent = span.dataset.original || span.textContent; });
    active.clear();
  }

  function animateAt(pointerX, pointerY) {
    const bounds = target.getBoundingClientRect();
    const localX = pointerX - bounds.left;
    const localY = pointerY - bounds.top;
    target.style.setProperty('--scramble-x', `${localX}px`);
    target.style.setProperty('--scramble-y', `${localY}px`);
    target.classList.add('scramble-active');
    const next = new Set();
    characters.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const distance = Math.hypot(pointerX - (rect.left + rect.width / 2), pointerY - (rect.top + rect.height / 2));
      if (distance <= 38 && span.textContent !== ' ') next.add(span);
    });
    const unchanged = next.size === active.size && [...next].every((span) => active.has(span));
    if (unchanged) return;

    restore();
    next.forEach((span) => {
      span.dataset.original = span.textContent;
      active.add(span);
    });
    if (!timer) {
      timer = setInterval(() => {
        active.forEach((span) => {
          span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        });
      }, 58);
    }
  }

  target.addEventListener('pointermove', (event) => animateAt(event.clientX, event.clientY));
  target.addEventListener('pointerleave', () => {
    clearInterval(timer);
    timer = null;
    restore();
    target.classList.remove('scramble-active');
  });
}
