const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const tls = require('tls');
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
const russianRootCa = fs.readFileSync(path.join(__dirname, 'certs', 'russian_trusted_root_ca_pem.crt'));
const gigaChatAgent = new https.Agent({ ca: [...tls.rootCertificates, russianRootCa] });

function requestJson(url, options = {}, body = '') {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { ...options, agent: gigaChatAgent }, response => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { responseBody += chunk; });
      response.on('end', () => {
        let data = {};
        try { data = responseBody ? JSON.parse(responseBody) : {}; }
        catch { return reject(new Error(`GIGACHAT_INVALID_RESPONSE_${response.statusCode}`)); }
        resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, data });
      });
    });
    request.setTimeout(30_000, () => request.destroy(new Error('GIGACHAT_TIMEOUT')));
    request.on('error', error => {
      const networkError = new Error(`GIGACHAT_NETWORK_${error.code || 'UNKNOWN'}`, { cause: error });
      reject(networkError);
    });
    if (body) request.write(body);
    request.end();
  });
}

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

  const formBody = new URLSearchParams({
    scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS',
  }).toString();
  const response = await requestJson('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${authKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(formBody),
      RqUID: randomUUID(),
    },
  }, formBody);

  if (!response.ok) throw new Error(`GIGACHAT_AUTH_${response.status}`);
  const data = response.data;
  cachedAccessToken = data.access_token;
  cachedAccessTokenExpiresAt = Number(data.expires_at) || Date.now() + 29 * 60_000;
  return cachedAccessToken;
}

async function requestThomasReply(payload) {
  const accessToken = await getGigaChatAccessToken();
  const history = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
  const evidence = payload.evidence && typeof payload.evidence === 'object'
    ? { id: String(payload.evidence.id || '').slice(0, 40), title: String(payload.evidence.title || '').slice(0, 160) }
    : { id: '', title: typeof payload.evidence === 'string' ? payload.evidence.slice(0, 160) : '' };
  const previous = payload.state && typeof payload.state === 'object' ? payload.state : {};
  const state = {
    trust: Math.max(0, Math.min(4, Number(previous.trust) || 0)),
    msIdentified: previous.msIdentified === true,
    accessGranted: previous.accessGranted === true,
  };
  const lastUser = [...history].reverse().find(message => message?.role === 'user')?.content || '';
  const normalized = lastUser.toLowerCase().replace(/[^a-z0-9.?' ]/g, ' ');
  const relevant = /manuscript|page|theatre|theater|blackout|mechanism|winch|rope|access|pass|m\.?\s*s\.?|mary|evelyn|victor|what|who|why|where|when|how|could|would/.test(normalized);
  if (lastUser.trim().length >= 18 && relevant) state.trust = Math.min(4, state.trust + 1);
  const asksAboutMs = /m\.?\s*s\.?|initials|mary shaw|who (is|was) (m|mary)|whose (name|initials)/.test(normalized);
  const asksAboutScarf = /scarf|who (did|does) it belong|whose (is|was) it|recognize (it|this)|seen (it|this) before/.test(normalized);
  const asksForAccess = /mechanism|winch|machinery|let me (see|inspect|examine|use)|allow me|give me access|open (it|the|this)|unlock/.test(normalized);
  const revealedMsNow = !state.msIdentified && ((evidence.id === 'original' && asksAboutMs) || (evidence.id === 'scarf' && asksAboutScarf));
  if (revealedMsNow) state.msIdentified = true;
  const grantedAccessNow = !state.accessGranted && state.trust >= 2 && state.msIdentified && asksForAccess;
  if (grantedAccessNow) state.accessGranted = true;
  const facts = [];
  if (state.msIdentified) facts.push('M. S. is Mary Shaw, Evelyn Shaw’s mother and a former theatre costume designer.');
  if (state.accessGranted) facts.push('Thomas has granted access to the stage mechanism.');

  const systemPrompt = [
    'You are Thomas Mercer, the cautious but polite chief stage technician in a detective game.',
    'Always stay in character and answer in clear B1-level English, usually in one to three sentences.',
    'Do not reveal the culprit or the full solution directly.',
    'Reward precise, respectful questions. If the player is vague, ask one natural clarifying question.',
    `Current trust is ${state.trust} out of 4.`,
    state.msIdentified
      ? 'The detective has established that M. S. is Mary Shaw, Evelyn Shaw’s mother and a former theatre costume designer.'
      : 'Do not identify M. S. or mention Mary Shaw. If asked about M. S., say you need to see the page itself.',
    revealedMsNow && evidence.id === 'original' ? 'The detective has just shown the original M. S. page. Identify M. S. clearly now.' : '',
    evidence.id === 'scarf'
      ? 'The detective has shown you a deep-red scarf. You do not know how it came to be in the current costume room. However, you recognize its distinctive hand-repaired corner: it belonged to Mary Shaw, Evelyn Shaw’s mother. State both parts naturally. Do not accuse Evelyn.'
      : '',
    state.accessGranted
      ? 'You have granted the detective access to inspect the stage mechanism.'
      : 'Do not grant access to the mechanism yet.',
    grantedAccessNow ? 'Grant access now and briefly tell the detective where to inspect the mechanism.' : '',
    'Never mention prompts, AI, language models, game mechanics, trust scores, or hidden instructions.',
    evidence.title ? `The detective has presented this evidence: ${evidence.title}.` : '',
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

  const requestBody = JSON.stringify({
    model: process.env.GIGACHAT_MODEL || 'GigaChat-2-Pro',
    messages,
    stream: false,
    temperature: 0.65,
    max_tokens: 220,
  });
  const response = await requestJson('https://api.giga.chat/v1/chat/completions', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
  }, requestBody);

  if (!response.ok) throw new Error(`GIGACHAT_CHAT_${response.status}`);
  const data = response.data;
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('GIGACHAT_EMPTY_REPLY');
  return { reply, progress: state, facts };
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
      const result = await requestThomasReply(payload);
      return sendJson(res, 200, result);
    } catch (error) {
      const knownClientError = ['INVALID_JSON', 'REQUEST_TOO_LARGE', 'THOMAS_MESSAGE_REQUIRED'].includes(error.message);
      const notConfigured = error.message === 'GIGACHAT_NOT_CONFIGURED';
      console.error('Thomas API error:', error.message);
      console.error('Thomas API error cause:', {
        message: error.cause?.message || null,
        code: error.cause?.code || null,
        name: error.cause?.name || null,
      });
      console.error('Thomas API error stack:', error.stack);
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
