// API Interceptor for frontend-only development
// This automatically provides mock data when backend is unavailable

import { mockApiClient } from './mock-api';

// Patch global fetch in Node.js (server-side) for mock mode
if (
  typeof global !== 'undefined' &&
  typeof window === 'undefined' &&
  (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
    process.env.NEXT_PUBLIC_ENV_MODE === 'MOCK')
) {
  const originalFetch = global.fetch;
  global.fetch = async (input: any, init?: any) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.toString()
            : '';
    if (
      url.includes('localhost:8000') ||
      url.includes('/health') ||
      url.includes('/status') ||
      url.includes('/feature-flags') ||
      url.includes('/billing')
    ) {
      const mockResponse = await mockApiClient.request(url, init || {});
      return new Response(
        JSON.stringify(mockResponse.data || {}),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return originalFetch(input, init);
  };
}

// Patch global fetch in browser for mock mode
if (
  typeof window !== 'undefined' &&
  (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
    process.env.NEXT_PUBLIC_ENV_MODE === 'MOCK')
) {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.toString()
            : '';
    console.log('[MOCK FETCH]', url); // Debug log
    if (
      url.includes('localhost:8000') ||
      url.includes('/health') ||
      url.includes('/status') ||
      url.includes('/feature-flags') ||
      url.includes('/billing')
    ) {
      const mockResponse = await mockApiClient.request(url, init || {});
      return new Response(
        JSON.stringify(mockResponse.data || {}),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return originalFetch(input, init);
  };
}

// Export mock clients for direct use
export { mockApiClient };

// Helper to check if mock mode is active
export const getMockMode = () => {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
         process.env.NEXT_PUBLIC_ENV_MODE === 'MOCK' ||
         !process.env.NEXT_PUBLIC_BACKEND_URL;
}; 