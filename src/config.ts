import type { OpenAPIV3 } from 'openapi-types';
import { z } from 'zod';

const envSchema = z.object({
  OPENAPI_SPEC_URL: z.string().min(1, 'OPENAPI_SPEC_URL is required'),
  API_BASE_URL: z.url().optional(),
  MCP_SERVER_NAME: z.string().min(1).optional(),
  PORT: z.coerce.number().int().positive().optional(),
});

export function getEnv() {
  return envSchema.parse(process.env);
}

interface Config {
  apiBaseUrl: string;
  serverName: string;
  serverVersion: string;
}

let cached: Config | null = null;

export function initConfig(spec: OpenAPIV3.Document) {
  if (cached) return cached;

  const env = getEnv();

  const apiBaseUrl = env.API_BASE_URL || spec.servers?.[0]?.url;
  if (!apiBaseUrl) {
    throw new Error(
      'Set API_BASE_URL env var or add servers[0].url to your OpenAPI spec',
    );
  }

  cached = {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    serverName: env.MCP_SERVER_NAME || spec.info?.title || 'OpenAPI MCP Server',
    serverVersion: spec.info?.version || '1.0.0',
  };
  return cached;
}

export function getConfig() {
  if (!cached) {
    throw new Error('Config not initialized. Call initConfig(spec) first.');
  }
  return cached;
}
