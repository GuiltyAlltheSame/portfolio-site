const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ALLOWED_ACTIONS = new Set(['contact', 'review']);

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  },
  body: JSON.stringify(payload)
});

const getRequestIp = (headers = {}) => {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  return String(
    normalized['x-nf-client-connection-ip']
      || normalized['cf-connecting-ip']
      || normalized['x-forwarded-for']
      || ''
  ).split(',')[0].trim();
};

const getAllowedHostnames = () => String(process.env.TURNSTILE_ALLOWED_HOSTNAMES || '')
  .split(',')
  .map((hostname) => hostname.trim().toLowerCase())
  .filter(Boolean);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Method not allowed.' });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return jsonResponse(500, { ok: false, error: 'Turnstile is not configured.' });
  }

  let body;

  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON body.' });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const action = typeof body.action === 'string' ? body.action.trim() : '';

  if (!token || token.length > 2048 || !ALLOWED_ACTIONS.has(action)) {
    return jsonResponse(400, { ok: false, error: 'Invalid verification request.' });
  }

  const verifyBody = new URLSearchParams({
    secret,
    response: token
  });
  const remoteIp = getRequestIp(event.headers);

  if (remoteIp) {
    verifyBody.set('remoteip', remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: verifyBody.toString()
    });
    const result = await response.json();
    const allowedHostnames = getAllowedHostnames();
    const hostname = String(result.hostname || '').toLowerCase();
    const hostnameAllowed = allowedHostnames.length === 0 || allowedHostnames.includes(hostname);
    const actionMatches = result.action === action;

    if (!response.ok || result.success !== true || !hostnameAllowed || !actionMatches) {
      console.warn('Turnstile verification rejected:', {
        action,
        returnedAction: result.action,
        hostname,
        errorCodes: result['error-codes'] || []
      });

      return jsonResponse(403, { ok: false, error: 'Verification failed.' });
    }

    return jsonResponse(200, { ok: true });
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return jsonResponse(502, { ok: false, error: 'Verification service unavailable.' });
  }
};
