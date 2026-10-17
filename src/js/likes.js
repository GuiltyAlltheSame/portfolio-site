import { supabase } from './db.js';

const COOLDOWN_MS = 60 * 60 * 1000;
const STORAGE_KEY = 'likes_block_until';

function readDeadline() {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch { return 0; }
}

export function initLikes() {
  const button = document.getElementById('like-btn');
  const count = button?.querySelector('.count');
  const status = document.getElementById('like-status');
  if (!button || !count || !status) return;
  let deadline = readDeadline();
  let pending = false;
  let hasResponseTotal = false;
  let timer = null;

  function refresh() {
    clearTimeout(timer);
    const remaining = Math.max(0, deadline - Date.now());
    button.disabled = pending || remaining > 0;
    button.classList.toggle('disabled', remaining > 0);
    button.setAttribute('aria-busy', String(pending));
    if (pending) status.textContent = 'SAVING YOUR LIKE?';
    else if (remaining > 0) {
      const seconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(seconds / 60);
      status.textContent = `NEXT LIKE IN ${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      timer = setTimeout(refresh, Math.min(1000, remaining));
    } else status.textContent = '';
  }

  function remember(value) {
    // Respect the server deadline; reloading never extends the cooldown.
    deadline = value;
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch {}
  }

  button.addEventListener('click', async () => {
    if (pending || Date.now() < deadline) return;
    pending = true;
    refresh();
    let errorMessage = '';
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(12000)
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 429) {
        const next = Date.parse(result.nextAllowedAt);
        // The edge rate limiter may return 429 without a JSON response.
        const retryAfter = Number(response.headers.get('Retry-After'));
        remember(Number.isFinite(next) ? next : Date.now() + (retryAfter > 0 ? retryAfter * 1000 : COOLDOWN_MS));
        if (Number.isSafeInteger(result.total)) { count.textContent = result.total; hasResponseTotal = true; }
      } else if (response.ok && result.ok === true && Number.isSafeInteger(result.total)) {
        count.textContent = result.total;
        hasResponseTotal = true;
        const next = Date.parse(result.nextAllowedAt);
        remember(Number.isFinite(next) ? next : Date.now() + COOLDOWN_MS);
        const icon = button.querySelector('.heart-icon');
        icon?.classList.replace('fa-regular', 'fa-solid');
        button.classList.add('heart-press');
        setTimeout(() => button.classList.remove('heart-press'), 180);
      } else throw new Error('Could not save like');
    } catch {
      errorMessage = 'LIKE NOT SAVED ? PLEASE TRY AGAIN';
    } finally {
      pending = false;
      refresh();
      if (errorMessage) status.textContent = errorMessage;
    }
  });

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY || event.key === null) {
      deadline = readDeadline();
      refresh();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { deadline = readDeadline(); refresh(); }
  });
  refresh();

  supabase.from('likes_counter').select('total').eq('id', 1).single()
    .then(({ data, error }) => {
      // A delayed initial read must not overwrite a newer successful click.
      if (!error && data && !hasResponseTotal) count.textContent = data.total;
    })
    .catch(() => {});
}

initLikes();
