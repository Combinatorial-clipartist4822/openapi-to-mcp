import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp';

import { callApi } from '../src/api-client';
import { initConfig, getConfig } from '../src/config';
import { parseOpenAPISpec, type ToolDefinition } from '../src/openapi-parser';

// Cache parsed tools in module scope (persists across warm invocations)
let cachedTools: ToolDefinition[] | null = null;

async function getTools() {
  if (cachedTools) return cachedTools;
  const { tools, spec } = await parseOpenAPISpec();
  initConfig(spec);
  cachedTools = tools;
  return cachedTools;
}

function createServer(tools: ToolDefinition[], clientHeaders: Headers) {
  const config = getConfig();
  const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion,
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      async (args) => {
        try {
          const result = await callApi(
            tool.method,
            tool.path,
            clientHeaders,
            args,
            tool.paramSources,
          );

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                }),
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  return server;
}

const STRIPPED_HEADERS = new Set([
  'host',
  'content-length',
  'content-type',
  'transfer-encoding',
  'accept-encoding',
  'connection',
  'keep-alive',
  'mcp-session-id',
  'mcp-protocol-version',
]);

function extractClientHeaders(req: Request) {
  const headers = new Headers();
  for (const [key, value] of req.headers.entries()) {
    if (!STRIPPED_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  return headers;
}

// Handle incoming requests
async function handleRequest(req: Request) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const tools = await getTools();
  const clientHeaders = extractClientHeaders(req);
  const server = createServer(tools, clientHeaders);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
  });

  await server.connect(transport);

  const response = await transport.handleRequest(req);

  // Add CORS headers
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const DELETE = handleRequest;
