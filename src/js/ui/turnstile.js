import { TURNSTILE_INVISIBLE_SITE_KEY } from '../config.js';
import { setFormStatus } from '../form-status.js';

const API_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const runtimeWidgets = new Map();
const pendingChallenges = new Map();
let apiPromise = null;

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

export async function initTurnstile() {
  if (!TURNSTILE_INVISIBLE_SITE_KEY) {
    return;
  }

  try {
    const turnstile = await loadTurnstileApi();

    if (TURNSTILE_INVISIBLE_SITE_KEY) {
      renderRuntimeWidget(turnstile, 'contact');
      renderRuntimeWidget(turnstile, 'review');
    }

  } catch (error) {
    console.error('Turnstile initialization error:', error);
    setFormStatus('SECURITY', 'OFFLINE', 'error');
  }
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
