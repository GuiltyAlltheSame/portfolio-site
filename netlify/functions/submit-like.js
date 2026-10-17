const { createHmac } = require('node:crypto');

const response = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  body: JSON.stringify(body)
});

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return response(405, { ok: false, error: 'Method not allowed.' });
  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return response(503, { ok: false, error: 'Likes are unavailable.' });

  // Use Netlify's connection address, never the client-supplied forwarded IP.
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
  const ip = String(headers['x-nf-client-connection-ip'] || '').trim();
  if (!ip) return response(400, { ok: false, error: 'Could not verify this connection.' });
  const visitorHash = createHmac('sha256', secret).update(`portfolio-like:${ip}`).digest('hex');

  try {
    const result = await fetch(`${url}/rest/v1/rpc/submit_portfolio_like`, {
      method: 'POST',
      headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_visitor_hash: visitorHash }),
      signal: AbortSignal.timeout(10000)
    });
    if (!result.ok) return response(502, { ok: false, error: 'Could not save your like.' });
    const data = await result.json();
    if (typeof data?.accepted !== 'boolean' || !Number.isSafeInteger(data.total) ||
        !Number.isFinite(Date.parse(data.next_allowed_at))) {
      return response(502, { ok: false, error: 'Invalid likes response.' });
    }
    const nextAllowedAt = data.next_allowed_at;
    if (!data.accepted) {
      const seconds = Math.max(1, Math.ceil((Date.parse(nextAllowedAt) - Date.now()) / 1000));
      return response(429, { ok: false, total: data.total, nextAllowedAt }, { 'Retry-After': String(seconds) });
    }
    return response(200, { ok: true, total: data.total, nextAllowedAt });
  } catch {
    return response(502, { ok: false, error: 'Likes are temporarily unavailable.' });
  }
};
