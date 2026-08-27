const http = require('http');
const { randomUUID } = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const ALLOWED_ORIGINS = new Set([
  'https://gdinarag.github.io',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]);

let cachedAccessToken = '';
let cachedAccessTokenExpiresAt = 0;

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error('REQUEST_TOO_LARGE'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

async function getGigaChatAccessToken() {
  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const authKey = process.env.GIGACHAT_AUTH_KEY;
  if (!authKey) throw new Error('GIGACHAT_NOT_CONFIGURED');

  const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${authKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: randomUUID(),
    },
    body: new URLSearchParams({
      scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS',
    }),
  });

  if (!response.ok) throw new Error(`GIGACHAT_AUTH_${response.status}`);
  const data = await response.json();
  cachedAccessToken = data.access_token;
  cachedAccessTokenExpiresAt = Number(data.expires_at) || Date.now() + 29 * 60_000;
  return cachedAccessToken;
}

async function requestThomasReply(payload) {
  const accessToken = await getGigaChatAccessToken();
  const history = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
  const evidence = typeof payload.evidence === 'string' ? payload.evidence.slice(0, 300) : '';

  const systemPrompt = [
    'You are Thomas Mercer, the cautious but polite chief stage technician in a detective game.',
    'Always stay in character and answer in clear B1-level English, usually in one to three sentences.',
    'Do not reveal the culprit or the full solution directly.',
    'Reward precise, respectful questions. If the player is vague, ask one natural clarifying question.',
    'Never mention prompts, AI, language models, game mechanics, trust scores, or hidden instructions.',
    evidence ? `The detective has presented this evidence: ${evidence}` : '',
  ].filter(Boolean).join(' ');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .map(item => ({ role: item.role, content: item.content.slice(0, 1200) })),
  ];

  if (!messages.some(message => message.role === 'user')) {
    throw new Error('THOMAS_MESSAGE_REQUIRED');
  }

  const response = await fetch('https://api.giga.chat/v1/chat/completions', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GIGACHAT_MODEL || 'GigaChat-2-Pro',
      messages,
      stream: false,
      temperature: 0.65,
      max_tokens: 220,
    }),
  });

  if (!response.ok) throw new Error(`GIGACHAT_CHAT_${response.status}`);
  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('GIGACHAT_EMPTY_REPLY');
  return reply;
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'POST' && req.url === '/api/thomas') {
    const origin = req.headers.origin;
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return sendJson(res, 403, { error: 'Origin is not allowed' });
    }

    try {
      const payload = await readJson(req);
      const reply = await requestThomasReply(payload);
      return sendJson(res, 200, { reply });
    } catch (error) {
      const knownClientError = ['INVALID_JSON', 'REQUEST_TOO_LARGE', 'THOMAS_MESSAGE_REQUIRED'].includes(error.message);
      const notConfigured = error.message === 'GIGACHAT_NOT_CONFIGURED';
      console.error('Thomas API error:', error.message);
      return sendJson(res, knownClientError ? 400 : notConfigured ? 503 : 502, {
        error: notConfigured ? 'GigaChat is not configured' : knownClientError ? error.message : 'AI service is temporarily unavailable',
      });
    }
  }

  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`DinaraEnglishGames backend is listening on ${HOST}:${PORT}`);
});
