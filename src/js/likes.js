import { supabase } from './db.js';

const COOLDOWN_MS = 60 * 60 * 1000;
const LIKE_WINDOW_MS = 8000;
const COOLDOWN_STORAGE_KEY = 'likes_block_until';
const WINDOW_STORAGE_KEY = 'likes_window_until';

function readDeadline(key) {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  } catch { return 0; }
}

function writeDeadline(key, value) {
  try { localStorage.setItem(key, String(value)); } catch {}
}

function clearDeadline(key) {
  try { localStorage.removeItem(key); } catch {}
}

export function initLikes() {
  const button = document.getElementById('like-btn');
  const count = button?.querySelector('.count');
  if (!button || !count) return;

  let cooldownUntil = readDeadline(COOLDOWN_STORAGE_KEY);
  let windowUntil = readDeadline(WINDOW_STORAGE_KEY);
  let pending = false;
  let hasResponseTotal = false;
  let animationFrame = null;

  function setFill(percent) {
    button.style.setProperty('--fill', `${Math.max(0, Math.min(100, percent))}%`);
  }

  function syncState() {
    const now = Date.now();
    const active = windowUntil > now;
    const blocked = !active && cooldownUntil > now;

    button.disabled = pending || blocked;
    button.classList.toggle('disabled', blocked);
    button.classList.toggle('active-fill', active);
    button.setAttribute('aria-busy', String(pending));

    if (active) {
      setFill(((windowUntil - now) / LIKE_WINDOW_MS) * 100);
      animationFrame = requestAnimationFrame(syncState);
      return;
    }

    if (windowUntil) {
      windowUntil = 0;
      clearDeadline(WINDOW_STORAGE_KEY);
    }
    setFill(0);
    animationFrame = null;
  }

  function beginLikeWindow() {
    if (windowUntil > Date.now()) return;
    windowUntil = Date.now() + LIKE_WINDOW_MS;
    writeDeadline(WINDOW_STORAGE_KEY, windowUntil);
    cancelAnimationFrame(animationFrame);
    syncState();
  }

  function rememberCooldown(value) {
    cooldownUntil = value;
    writeDeadline(COOLDOWN_STORAGE_KEY, value);
  }

  function flashHeart() {
    const icon = button.querySelector('.heart-icon');
    icon?.classList.replace('fa-regular', 'fa-solid');
    icon?.classList.add('heart-press');
    setTimeout(() => {
      icon?.classList.replace('fa-solid', 'fa-regular');
      icon?.classList.remove('heart-press');
    }, 180);
  }

  button.addEventListener('click', async () => {
    const now = Date.now();
    if (pending || (windowUntil <= now && cooldownUntil > now)) return;

    pending = true;
    syncState();
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(12000)
      });
      const result = await response.json().catch(() => ({}));
      const next = Date.parse(result.nextAllowedAt);
      if (Number.isFinite(next)) rememberCooldown(next);

      if (response.ok && result.ok === true && Number.isSafeInteger(result.total)) {
        count.textContent = result.total;
        hasResponseTotal = true;
        beginLikeWindow();
        flashHeart();
      } else if (response.status === 429) {
        windowUntil = 0;
        clearDeadline(WINDOW_STORAGE_KEY);
      }
    } catch {
      // Keep the counter and the button quiet if the request cannot be saved.
    } finally {
      pending = false;
      cancelAnimationFrame(animationFrame);
      syncState();
    }
  });

  window.addEventListener('storage', event => {
    if (event.key === COOLDOWN_STORAGE_KEY || event.key === WINDOW_STORAGE_KEY || event.key === null) {
      cooldownUntil = readDeadline(COOLDOWN_STORAGE_KEY);
      windowUntil = readDeadline(WINDOW_STORAGE_KEY);
      cancelAnimationFrame(animationFrame);
      syncState();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      cooldownUntil = readDeadline(COOLDOWN_STORAGE_KEY);
      windowUntil = readDeadline(WINDOW_STORAGE_KEY);
      cancelAnimationFrame(animationFrame);
      syncState();
    }
  });

  syncState();

  supabase.from('likes_counter').select('total').eq('id', 1).single()
    .then(({ data, error }) => {
      if (!error && data && !hasResponseTotal) count.textContent = data.total;
    })
    .catch(() => {});
}

initLikes();
