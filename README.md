# openapi-to-mcp

A minimal [MCP](https://modelcontextprotocol.io) server that auto-generates tools from your OpenAPI spec. Optimized for Vercel's serverless architecture.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AudienceLabV3/openapi-to-mcp&env=OPENAPI_SPEC_URL&envDescription=URL%20to%20your%20OpenAPI%20spec&envLink=https://github.com/AudienceLabV3/openapi-to-mcp%23configuration)

## Quick Start

1. Fork this repo
2. Set `OPENAPI_SPEC_URL` to your OpenAPI spec URL
3. Deploy to Vercel

## Configuration

| Variable           | Required | Description                                                            |
| ------------------ | -------- | ---------------------------------------------------------------------- |
| `OPENAPI_SPEC_URL` | Yes      | URL or file path to your OpenAPI spec (YAML or JSON)                   |
| `API_BASE_URL`     | No       | Override the API base URL (defaults to `servers[0].url` from the spec) |
| `MCP_SERVER_NAME`  | No       | Override the MCP server name (defaults to `info.title` from the spec)  |
| `PORT`             | No       | Local dev server port (default: 3000)                                  |

## How It Works

1. On cold start, the server fetches and parses your OpenAPI spec
2. Each API endpoint becomes an MCP tool with a Zod-validated input schema
3. When a tool is called, the request is forwarded to your API with the caller's headers (API key, Bearer token, etc.) passed through unchanged
4. The spec and tools are cached in memory — warm invocations skip the fetch

## Running Locally

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create `.env` and set `OPENAPI_SPEC_URL` to your OpenAPI spec. For local dev, this can be a remote URL or an absolute file path:

```env
# Remote URL
OPENAPI_SPEC_URL=https://api.example.com/openapi.yaml

# Or an absolute file path (local dev only)
OPENAPI_SPEC_URL=/path/to/your/openapi.yml
```

### 3. Start the dev server

```bash
pnpm dev
```

The server starts at `http://localhost:3000/mcp`.

### 4. Connect your MCP client to the local server

How you connect to the MCP server depends on your client (Claude Code, Cursor, VS Code, etc.) — check your client's docs for where to add MCP servers. Most clients use a similar JSON format. Here's an example for Claude Code (`.mcp.json`):

```json
{
  "mcpServers": {
    "my-api": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>"
      }
    }
  }
}
```

The `headers` block above shows a `Bearer` token, but you can use any header your API requires. The MCP server forwards all headers from your client config to the target API on every tool call without modification — it doesn't validate, store, or care which header is "the auth header". See [Auth](#auth) for examples (API key, Bearer token, multiple headers).

## Deploying to Vercel

1. Push this repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add `OPENAPI_SPEC_URL` under **Settings > Environment Variables**. `API_BASE_URL` and `MCP_SERVER_NAME` are optional overrides.

That's it. Your MCP server is live at `https://your-project.vercel.app/mcp`. Connect clients the same way as [local](#4-connect-your-mcp-client-to-the-local-server) — just swap the URL.

## Auth

All headers from your MCP client config are forwarded to the target API on every tool call. The MCP server does not validate or store credentials — your API handles authentication.

Configure whatever headers your API expects in the client config:

```json
// API key auth
"headers": { "X-Api-Key": "<your-key>" }

// Bearer token
"headers": { "Authorization": "Bearer <your-token>" }

// Multiple headers
"headers": { "Authorization": "Bearer <token>", "X-Org-Id": "org_123" }
```
