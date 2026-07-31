/**
 * Custom HTTP client for Orval-generated SDKs.
 *
 * Orval calls: customClient<T>(config, requestOptions?)
 * where config = { url, method, headers, data, params, signal }
 *
 * We map that to a native fetch() call and return the parsed JSON directly
 * (no Axios-style `.data` wrapper).
 */

export interface CustomClientConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  signal?: AbortSignal;
}

export const customClient = async <T>(
  config: CustomClientConfig,
  // Second param is reserved for per-request overrides (not used)
  _options?: unknown,
): Promise<T> => {
  const { url, method, headers: configHeaders, params, data, signal } = config;

  // Build query string from params
  let fullUrl = url;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    fullUrl = `${url}?${searchParams.toString()}`;
  }

  const headers = new Headers(configHeaders as HeadersInit | undefined);

  // Inject Correlation ID
  headers.set('X-Correlation-ID', crypto.randomUUID());

  // Inject auth token from cookie (server-side: cookie is forwarded automatically;
  // client-side: read from document.cookie)
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    if (match) {
      headers.set('Authorization', `Bearer ${decodeURIComponent(match[1])}`);
    }
  }

  // Set content-type for POST/PUT/PATCH when not already set
  if (data !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error ${response.status}: ${errorBody}`);
  }

  // Handle No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};
