import { getConfig } from './config.js';

export interface ParamSource {
  name: string;
  in: 'path' | 'query' | 'body';
}

/**
 * Calls the target API, splitting flat MCP tool params back into
 * path params, query params, and request body.
 */
export async function callApi(
  method: string,
  pathTemplate: string,
  headers: Headers,
  params: Record<string, unknown>,
  paramSources: ParamSource[],
) {
  // Build sets for fast lookup
  const pathParams = new Set<string>();
  const queryParams = new Set<string>();
  for (const source of paramSources) {
    if (source.in === 'path') pathParams.add(source.name);
    if (source.in === 'query') queryParams.add(source.name);
  }

  // Substitute path params
  let path = pathTemplate;
  for (const name of pathParams) {
    const value = params[name];
    if (value === undefined) {
      throw new Error(`Missing required path parameter: ${name}`);
    }
    path = path.replace(`{${name}}`, encodeURIComponent(String(value)));
  }

  // Build URL with query params
  const url = new URL(path, getConfig().apiBaseUrl);
  for (const name of queryParams) {
    const value = params[name];
    if (value !== undefined) {
      url.searchParams.set(name, String(value));
    }
  }

  // Everything else is body
  const bodyParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!pathParams.has(key) && !queryParams.has(key) && value !== undefined) {
      bodyParams[key] = value;
    }
  }

  const hasBody =
    Object.keys(bodyParams).length > 0 &&
    method !== 'GET' &&
    method !== 'DELETE';

  const requestHeaders = new Headers(headers);
  if (hasBody) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url.toString(), {
    method,
    headers: requestHeaders,
    ...(hasBody && { body: JSON.stringify(bodyParams) }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API returned ${response.status}: ${text}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
