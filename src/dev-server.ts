import { createServer } from 'node:http';

import { getEnv } from './config.js';

const PORT = getEnv().PORT || 3000;

// Dynamic import so the handler is loaded after env vars are set
const { GET, POST, DELETE } = await import('../api/server.js');

const handlers: Record<string, typeof GET> = { GET, POST, DELETE };

const server = createServer(async (req, res) => {
  const method = req.method ?? 'GET';

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  const handler = handlers[method];
  if (!handler) {
    res.writeHead(405).end('Method not allowed');
    return;
  }

  // Convert Node IncomingMessage → Web Request
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value)
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  const body =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          req.on('data', (c: Buffer) => chunks.push(c));
          req.on('end', () => resolve(Buffer.concat(chunks)));
          req.on('error', reject);
        });

  const webReq = new Request(url.toString(), {
    method,
    headers,
    body: body ? new Uint8Array(body) : undefined,
    ...(body ? { duplex: 'half' as const } : {}),
  });

  const webRes = await handler(webReq);

  // Convert Web Response → Node ServerResponse
  res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()));

  if (webRes.body) {
    const reader = webRes.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };
    await pump();
  } else {
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`MCP server running at http://localhost:${PORT}/mcp`);
});
