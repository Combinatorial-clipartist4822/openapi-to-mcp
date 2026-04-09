import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ParamSource } from '../src/api-client.js';

// Mock config before importing api-client
vi.mock('../src/config.js', () => ({
  getConfig: () => ({ apiBaseUrl: 'https://api.test.com' }),
}));

const { callApi } = await import('../src/api-client.js');

describe('callApi', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  function jsonResponse(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  function headers(entries: Record<string, string> = {}) {
    return new Headers(entries);
  }

  it('substitutes path params and encodes them', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const sources: ParamSource[] = [{ name: 'id', in: 'path' }];
    await callApi(
      'GET',
      '/items/{id}',
      headers(),
      { id: 'hello world' },
      sources,
    );

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('/items/hello%20world');
  });

  it('throws on missing required path param', async () => {
    const sources: ParamSource[] = [{ name: 'id', in: 'path' }];
    await expect(
      callApi('GET', '/items/{id}', headers(), {}, sources),
    ).rejects.toThrow('Missing required path parameter: id');
  });

  it('appends query params to URL', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    const sources: ParamSource[] = [{ name: 'limit', in: 'query' }];
    await callApi('GET', '/items', headers(), { limit: 10 }, sources);

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('limit=10');
  });

  it('sends body for POST requests', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: '1' }));

    const sources: ParamSource[] = [
      { name: 'id', in: 'path' },
      { name: 'name', in: 'body' },
    ];
    await callApi(
      'POST',
      '/items/{id}',
      headers(),
      { id: '1', name: 'Test' },
      sources,
    );

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ name: 'Test' });
    expect(opts.headers.get('Content-Type')).toBe('application/json');
  });

  it('does not send body for GET requests', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    const sources: ParamSource[] = [{ name: 'extra', in: 'body' }];
    await callApi('GET', '/items', headers(), { extra: 'ignored' }, sources);

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.body).toBeUndefined();
  });

  it('forwards client headers to the target API', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    await callApi(
      'GET',
      '/items',
      headers({ 'X-Api-Key': 'my-secret', Authorization: 'Bearer tok123' }),
      {},
      [],
    );

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers.get('X-Api-Key')).toBe('my-secret');
    expect(opts.headers.get('Authorization')).toBe('Bearer tok123');
  });

  it('throws on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Not Found', { status: 404 }));

    await expect(callApi('GET', '/items', headers(), {}, [])).rejects.toThrow(
      'API returned 404: Not Found',
    );
  });
});
