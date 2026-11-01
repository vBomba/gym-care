import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const TOKEN = process.env.SYNC_TOKEN || 'dev-sync-token';
const DATA_DIR = join(__dirname, 'data');
const BUNDLE_PATH = join(DATA_DIR, 'bundle.json');
const META_PATH = join(DATA_DIR, 'meta.json');

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readMeta() {
  try {
    const raw = await readFile(META_PATH, 'utf8');
    const meta = JSON.parse(raw);
    if (meta && typeof meta.revision === 'string') {
      return meta;
    }
  } catch {
    /* empty */
  }
  return { revision: '0' };
}

async function writeMeta(meta) {
  await writeFile(META_PATH, JSON.stringify(meta, null, 2), 'utf8');
}

async function readBundle() {
  try {
    const raw = await readFile(BUNDLE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function send(res, status, body, headers = {}) {
  const payload = body === null || body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Match',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Expose-Headers': 'ETag',
    ...headers,
  });
  res.end(payload);
}

function unauthorized(res) {
  send(res, 401, { error: 'unauthorized' });
}

function checkAuth(req) {
  const header = req.headers.authorization || '';
  const expected = `Bearer ${TOKEN}`;
  return header === expected;
}

function parseIfMatch(value) {
  if (!value) {
    return null;
  }
  return String(value).trim().replaceAll('"', '');
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function isBundle(value) {
  return (
    value &&
    typeof value === 'object' &&
    value.schemaVersion === 1 &&
    value.program &&
    value.program.id === 'main' &&
    Array.isArray(value.sessions) &&
    Array.isArray(value.deletions) &&
    typeof value.deviceId === 'string'
  );
}

await ensureDataDir();

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'OPTIONS') {
      send(res, 204, null);
      return;
    }

    if (url.pathname !== '/v1/sync') {
      send(res, 404, { error: 'not-found' });
      return;
    }

    if (!checkAuth(req)) {
      unauthorized(res);
      return;
    }

    if (req.method === 'GET') {
      const bundle = await readBundle();
      if (!bundle) {
        send(res, 404, { error: 'empty' });
        return;
      }
      const meta = await readMeta();
      send(res, 200, bundle, { ETag: `"${meta.revision}"` });
      return;
    }

    if (req.method === 'PUT') {
      const raw = await readBody(req);
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        send(res, 400, { error: 'invalid-json' });
        return;
      }
      if (!isBundle(body)) {
        send(res, 400, { error: 'invalid-bundle' });
        return;
      }

      const meta = await readMeta();
      const existing = await readBundle();
      const clientRevision = parseIfMatch(req.headers['if-match']);

      if (existing && clientRevision && clientRevision !== meta.revision) {
        send(res, 412, { error: 'conflict', revision: meta.revision }, {
          ETag: `"${meta.revision}"`,
        });
        return;
      }

      const nextRevision = String(Number(meta.revision || '0') + 1);
      await writeFile(BUNDLE_PATH, JSON.stringify(body, null, 2), 'utf8');
      await writeMeta({ revision: nextRevision, updatedAt: new Date().toISOString() });
      send(res, 200, { ok: true, revision: nextRevision }, {
        ETag: `"${nextRevision}"`,
      });
      return;
    }

    send(res, 405, { error: 'method-not-allowed' });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: 'server-error' });
  }
});

server.listen(PORT, () => {
  console.log(`Gym Care sync on http://localhost:${PORT}`);
  console.log(`Bearer token: ${TOKEN}`);
});
