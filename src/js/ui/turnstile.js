import {
  TURNSTILE_DEBUG_SITE_KEY,
  TURNSTILE_INVISIBLE_SITE_KEY
} from '../config.js';
import { setFormStatus } from '../form-status.js';

const API_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const DEBUG_STORAGE_KEY = 'portfolio.turnstileDebugVisible';
const runtimeWidgets = new Map();
const pendingChallenges = new Map();
let apiPromise = null;
let debugWidgetId = null;

function isDebugVisible() {
  try {
    return localStorage.getItem(DEBUG_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadTurnstileApi() {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src^="${API_URL.split('?')[0]}"]`);
    const script = existingScript || document.createElement('script');

    script.addEventListener('load', () => resolve(window.turnstile), { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile API failed to load.')), { once: true });

    if (!existingScript) {
      script.src = API_URL;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });

  return apiPromise;
}

function settleChallenge(formType, method, value) {
  const challenge = pendingChallenges.get(formType);
  if (!challenge) return;

  pendingChallenges.delete(formType);
  challenge[method](value);
}

function renderRuntimeWidget(turnstile, formType) {
  const host = document.getElementById(`${formType}-turnstile`);
  if (!host || runtimeWidgets.has(formType)) return;

  const widgetId = turnstile.render(host, {
    sitekey: TURNSTILE_INVISIBLE_SITE_KEY,
    size: 'invisible',
    execution: 'execute',
    action: formType,
    callback: (token) => settleChallenge(formType, 'resolve', token),
    'expired-callback': () => settleChallenge(formType, 'reject', new Error('Verification expired.')),
    'error-callback': () => {
      settleChallenge(formType, 'reject', new Error('Verification failed.'));
      return true;
    }
  });

  runtimeWidgets.set(formType, widgetId);
}

async function renderDebugWidget(turnstile) {
  const panel = document.getElementById('turnstile-debug-panel');
  const host = document.getElementById('turnstile-debug-widget');
  const status = document.getElementById('turnstile-debug-status');

  if (!panel || !host || !status || !isDebugVisible()) return;

  panel.hidden = false;

  if (!TURNSTILE_DEBUG_SITE_KEY) {
    status.textContent = 'managed debug site key required';
    return;
  }

  if (debugWidgetId !== null) return;

  debugWidgetId = turnstile.render(host, {
    sitekey: TURNSTILE_DEBUG_SITE_KEY,
    appearance: 'always',
    action: 'debug',
    callback: () => {
      status.textContent = 'verification passed';
    },
    'expired-callback': () => {
      status.textContent = 'verification expired';
    },
    'error-callback': (code) => {
      status.textContent = `verification error: ${code}`;
      return true;
    }
  });

  status.textContent = 'challenge ready';
}

export async function initTurnstile() {
  const debugPanel = document.getElementById('turnstile-debug-panel');

  if (debugPanel && isDebugVisible()) {
    debugPanel.hidden = false;
  }

  if (!TURNSTILE_INVISIBLE_SITE_KEY && !TURNSTILE_DEBUG_SITE_KEY) {
    return;
  }

  try {
    const turnstile = await loadTurnstileApi();

    if (TURNSTILE_INVISIBLE_SITE_KEY) {
      renderRuntimeWidget(turnstile, 'contact');
      renderRuntimeWidget(turnstile, 'review');
    }

    await renderDebugWidget(turnstile);
  } catch (error) {
    console.error('Turnstile initialization error:', error);
    setFormStatus('SECURITY', 'OFFLINE', 'error');
  }

  window.addEventListener('storage', async (event) => {
    if (event.key !== DEBUG_STORAGE_KEY || !debugPanel) return;

    debugPanel.hidden = !isDebugVisible();

    if (isDebugVisible() && TURNSTILE_DEBUG_SITE_KEY) {
      try {
        await renderDebugWidget(await loadTurnstileApi());
      } catch (error) {
        console.error('Turnstile debug widget error:', error);
      }
    }
  });
}

export async function requestTurnstileToken(formType) {
  if (!TURNSTILE_INVISIBLE_SITE_KEY) {
    throw new Error('Turnstile is not configured.');
  }

  const turnstile = await loadTurnstileApi();
  const widgetId = runtimeWidgets.get(formType);

  if (widgetId === undefined) {
    throw new Error(`Turnstile widget is missing for ${formType}.`);
  }

  if (pendingChallenges.has(formType)) {
    return pendingChallenges.get(formType).promise;
  }

  let resolveChallenge;
  let rejectChallenge;
  const promise = new Promise((resolve, reject) => {
    resolveChallenge = resolve;
    rejectChallenge = reject;
  });

  pendingChallenges.set(formType, {
    promise,
    resolve: resolveChallenge,
    reject: rejectChallenge
  });

  turnstile.execute(widgetId);
  return promise;
}

export function isTurnstileConfigured() {
  return Boolean(TURNSTILE_INVISIBLE_SITE_KEY);
}

export function resetTurnstile(formType) {
  const widgetId = runtimeWidgets.get(formType);

  if (widgetId !== undefined && window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}
