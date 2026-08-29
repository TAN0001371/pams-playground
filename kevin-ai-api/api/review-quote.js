const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const MAX_BODY_BYTES = 120000;
const MAX_CALLS_PER_WINDOW = 20;
const WINDOW_MS = 10 * 60 * 1000;

// This is intentionally best-effort in-memory limiting. Vercel may run more
// than one instance, so the authenticated Firebase user check is the primary
// protection and this limit is an additional guard against accidental loops.
const requestWindow = new Map();

function json(res, status, body, extraHeaders) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  Object.entries(extraHeaders || {}).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

function allowedOrigin(origin) {
  return origin === 'https://tan0001371.github.io' ||
    origin === 'http://localhost:3000' ||
    origin === 'http://127.0.0.1:3000' ||
    origin === 'http://localhost:5173' ||
    origin === 'http://127.0.0.1:5173';
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigin(origin) ? origin : 'https://tan0001371.github.io',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return {};
}

function cleanText(value, max = 1600) {
  return String(value || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function cleanNumber(value, max = 100000000) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
}

function cleanPayload(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const cleanMaterial = (item) => ({
    item: cleanText(item && item.item, 120),
    qty: cleanNumber(item && item.qty, 100000),
    unit: cleanText(item && item.unit, 30),
    sell: cleanNumber(item && item.sell)
  });
  const cleanLabour = (item) => ({
    worker: cleanText(item && item.worker, 100),
    hours: cleanNumber(item && item.hours, 100000),
    sell: cleanNumber(item && item.sell)
  });
  const cleanQuote = (quote) => ({
    type: cleanText(quote && quote.type, 40),
    date: cleanText(quote && quote.date, 30),
    totalHours: cleanNumber(quote && quote.totalHours, 100000),
    materials: Array.isArray(quote && quote.materials) ? quote.materials.slice(0, 60).map(cleanMaterial) : [],
    labour: Array.isArray(quote && quote.labour) ? quote.labour.slice(0, 30).map(cleanLabour) : [],
    totals: {
      materials: cleanNumber(quote && quote.totals && quote.totals.materials),
      labour: cleanNumber(quote && quote.totals && quote.totals.labour),
      total: cleanNumber(quote && quote.totals && quote.totals.total)
    }
  });
  const checklist = {};
  if (source.checklist && typeof source.checklist === 'object') {
    Object.entries(source.checklist).slice(0, 30).forEach(([key, value]) => {
      checklist[cleanText(key, 40)] = cleanText(value, 30);
    });
  }
  const feedback = Array.isArray(source.upsellFeedback) ? source.upsellFeedback.slice(0, 30).map(item => ({
    label: cleanText(item && item.label, 120),
    rating: cleanText(item && (item.rating || item.value), 20),
    count: cleanNumber(item && item.count, 1000)
  })) : [];
  return {
    jobType: cleanText(source.jobType, 40),
    scope: cleanText(source.scope, 2500),
    checklist,
    materials: Array.isArray(source.materials) ? source.materials.slice(0, 80).map(cleanMaterial) : [],
    labour: Array.isArray(source.labour) ? source.labour.slice(0, 40).map(cleanLabour) : [],
    totals: {
      materials: cleanNumber(source.totals && source.totals.materials),
      labour: cleanNumber(source.totals && source.totals.labour),
      total: cleanNumber(source.totals && source.totals.total),
      profitPct: cleanNumber(source.totals && source.totals.profitPct, 100)
    },
    previousQuotes: Array.isArray(source.previousQuotes) ? source.previousQuotes.slice(0, 8).map(cleanQuote) : [],
    upsellFeedback: feedback,
    audit: Array.isArray(source.audit) ? source.audit.slice(0, 20).map(x => cleanText(x, 220)) : [],
    selectedUpsells: Array.isArray(source.selectedUpsells) ? source.selectedUpsells.slice(0, 12).map(x => cleanText(x, 100)) : []
  };
}

async function verifyFirebaseUser(req) {
  const authorization = req.headers.authorization || '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token || token.length > 10000) return null;

  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  const allowed = new Set((process.env.ALLOWED_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean));
  if (!apiKey || !allowed.size) return null;

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({idToken: token})
  });
  if (!response.ok) return null;
  const data = await response.json();
  const user = Array.isArray(data.users) ? data.users[0] : null;
  if (!user || !allowed.has(String(user.email || '').toLowerCase())) return null;
  return {email: String(user.email).toLowerCase(), localId: user.localId || ''};
}

function checkRateLimit(user) {
  const now = Date.now();
  const current = requestWindow.get(user.localId) || {started: now, count: 0};
  if (now - current.started >= WINDOW_MS) {
    current.started = now;
    current.count = 0;
  }
  current.count += 1;
  requestWindow.set(user.localId, current);
  return current.count <= MAX_CALLS_PER_WINDOW;
}

function extractJson(text) {
  if (text && typeof text === 'object') return text;
  const value = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(value); } catch (_) {
    const start = value.indexOf('{');
    if (start >= 0) {
      // Accept a valid JSON object surrounded by a short explanation or
      // markdown. Stop at the first balanced closing brace that parses.
      let depth = 0;
      let quoted = false;
      let escaped = false;
      for (let i = start; i < value.length; i += 1) {
        const character = value[i];
        if (quoted) {
          if (escaped) escaped = false;
          else if (character === '\\') escaped = true;
          else if (character === '"') quoted = false;
          continue;
        }
        if (character === '"') quoted = true;
        else if (character === '{') depth += 1;
        else if (character === '}') {
          depth -= 1;
          if (depth === 0) {
            try { return JSON.parse(value.slice(start, i + 1)); } catch (_) { /* keep scanning */ }
          }
        }
      }
    }
    throw new Error('DeepSeek did not return JSON');
  }
}

function normaliseReview(value) {
  const list = (key) => Array.isArray(value && value[key]) ? value[key].map(x => cleanText(x, 280)).filter(Boolean).slice(0, 6) : [];
  const upsells = Array.isArray(value && value.upsells) ? value.upsells.map(item => ({
    label: cleanText(item && item.label, 100),
    reason: cleanText(item && item.reason, 260)
  })).filter(item => item.label && item.reason).slice(0, 4) : [];
  return {missing: list('missing'), risks: list('risks'), patterns: list('patterns'), upsells};
}

function buildPrompt(payload) {
  return `You are a careful quote-review assistant for an experienced Australian tradie. Review the supplied quote and history.

Return ONLY one valid JSON object with exactly these arrays:
{"missing":["..."],"risks":["..."],"patterns":["..."],"upsells":[{"label":"...","reason":"..."}]}

Rules:
- Do not invent quantities, prices, regulations, or facts. Say when there is not enough evidence.
- missing: likely cost or scope items that appear relevant but are absent, based on this job's scope, checklist, and prior jobs.
- risks: pricing or completeness concerns worth checking, including suspiciously high apparent hourly returns when the quote may omit overhead, travel, disposal, admin, or other business costs. Do not declare the quote wrong.
- patterns: useful repeated materials, unusual omissions, or differences from previous jobs. Use the history only as evidence.
- upsells: maximum 3 genuinely optional, specific, non-default add-ons. Do not label required base-scope items as upsells. Do not repeat an idea marked bad in the feedback. Keep each reason short and practical.
- Keep the tone direct and respectful: he knows the trade; this is a second set of eyes.
- Never include customer names, addresses, or other identifying details. Use AUD where money is discussed.

QUOTE DATA:
${JSON.stringify(payload)}`;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const headers = corsHeaders(origin);
  if (req.method === 'OPTIONS') return json(res, 204, {}, headers);
  if (req.method !== 'POST') return json(res, 405, {error: 'Method not allowed'}, headers);
  if (!process.env.DEEPSEEK_API_KEY) return json(res, 503, {error: 'AI service is not configured'}, headers);

  const rawLength = Number(req.headers['content-length'] || 0);
  if (rawLength > MAX_BODY_BYTES) return json(res, 413, {error: 'Quote review is too large'}, headers);

  let user;
  try { user = await verifyFirebaseUser(req); } catch (_) { user = null; }
  if (!user) return json(res, 401, {error: 'Sign in is required for AI review'}, headers);
  if (!checkRateLimit(user)) return json(res, 429, {error: 'Too many AI reviews. Try again in a few minutes.'}, headers);

  const payload = cleanPayload(readBody(req));
  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
        messages: [
          {role: 'system', content: 'Return strict JSON only. Never expose private identity details.'},
          {role: 'user', content: buildPrompt(payload)}
        ],
        response_format: {type: 'json_object'},
        temperature: 0.2,
        max_tokens: 900
      })
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('DeepSeek request failed', response.status, result && result.error && result.error.type);
      return json(res, 502, {error: 'AI review could not be completed'}, headers);
    }
    const message = result && result.choices && result.choices[0] && result.choices[0].message;
    const contentCandidates = message ? [message.content, message.reasoning_content] : [];
    let parsed;
    for (const candidate of contentCandidates) {
      if (candidate == null || candidate === '') continue;
      try { parsed = extractJson(candidate); break; } catch (_) { /* try the next response field */ }
    }
    if (!parsed) throw new Error('DeepSeek did not return JSON');
    const review = normaliseReview(parsed);
    return json(res, 200, review, headers);
  } catch (error) {
    console.error('AI review error', error && error.message);
    return json(res, 502, {error: 'AI review could not be completed'}, headers);
  }
};
