const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

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

async function verifyTurnstile({ headers, token, action }) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { ok: false, statusCode: 500, error: 'Turnstile is not configured.' };
  }

  if (!token || token.length > 2048) {
    return { ok: false, statusCode: 400, error: 'Invalid verification request.' };
  }

  const verifyBody = new URLSearchParams({ secret, response: token });
  const remoteIp = getRequestIp(headers);
  if (remoteIp) verifyBody.set('remoteip', remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyBody.toString()
    });
    const result = await response.json();
    const hostname = String(result.hostname || '').toLowerCase();
    const allowedHostnames = getAllowedHostnames();
    const hostnameAllowed = allowedHostnames.length === 0 || allowedHostnames.includes(hostname);

    if (!response.ok || result.success !== true || result.action !== action || !hostnameAllowed) {
      console.warn('Turnstile verification rejected:', {
        action,
        returnedAction: result.action,
        hostname,
        errorCodes: result['error-codes'] || []
      });
      return { ok: false, statusCode: 403, error: 'Verification failed.' };
    }

    return { ok: true };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { ok: false, statusCode: 502, error: 'Verification service unavailable.' };
  }
}

async function insertIntoSupabase(table, record) {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return { ok: false, statusCode: 500, error: 'Submission service is not configured.' };
  }

  try {
    const response = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      console.error('Supabase insert rejected:', table, response.status);
      return { ok: false, statusCode: 502, error: 'Submission could not be saved.' };
    }

    return { ok: true };
  } catch (error) {
    console.error('Supabase insert error:', error);
    return { ok: false, statusCode: 502, error: 'Submission service unavailable.' };
  }
}

function createSubmissionHandler({ action, table, parseRecord }) {
  return async (event) => {
    if (event.httpMethod !== 'POST') {
      return jsonResponse(405, { ok: false, error: 'Method not allowed.' });
    }

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return jsonResponse(400, { ok: false, error: 'Invalid JSON body.' });
    }

    if (typeof body.company === 'string' && body.company.trim()) {
      return jsonResponse(200, { ok: true });
    }

    const record = parseRecord(body);
    if (!record) {
      return jsonResponse(400, { ok: false, error: 'Check the form fields.' });
    }

    const verification = await verifyTurnstile({
      headers: event.headers,
      token: typeof body.token === 'string' ? body.token.trim() : '',
      action
    });
    if (!verification.ok) {
      return jsonResponse(verification.statusCode, { ok: false, error: verification.error });
    }

    const insertion = await insertIntoSupabase(table, record);
    if (!insertion.ok) {
      return jsonResponse(insertion.statusCode, { ok: false, error: insertion.error });
    }

    return jsonResponse(200, { ok: true });
  };
}

module.exports = { createSubmissionHandler };
