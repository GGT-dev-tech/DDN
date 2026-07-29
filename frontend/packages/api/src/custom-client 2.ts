export const customClient = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const headers = new Headers(options.headers);
  
  // Implement auth token injection here
  // headers.set('Authorization', `Bearer ${token}`);
  
  // Inject Correlation ID
  headers.set('X-Correlation-ID', crypto.randomUUID());

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle global errors, token refresh, etc.
    const errorBody = await response.text();
    throw new Error(`HTTP error ${response.status}: ${errorBody}`);
  }

  // Handle No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};
