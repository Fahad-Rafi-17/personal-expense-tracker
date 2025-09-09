import { getDeviceToken, getDeviceId } from './auth';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Authenticated fetch wrapper that automatically includes device token
 */
export async function authenticatedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const token = getDeviceToken();
  const deviceId = getDeviceId();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authentication token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add device ID header for tracking
  if (deviceId) {
    headers['X-Device-ID'] = deviceId;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If we get a 401, the token might be invalid - we should trigger re-authentication
  if (response.status === 401) {
    // Dispatch a custom event that the auth context can listen to
    window.dispatchEvent(new CustomEvent('auth:token-invalid'));
  }
  
  return response;
}

/**
 * GET request with authentication
 */
export async function get(url: string, options: Omit<FetchOptions, 'method'> = {}): Promise<Response> {
  return authenticatedFetch(url, { ...options, method: 'GET' });
}

/**
 * POST request with authentication
 */
export async function post(url: string, data?: any, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<Response> {
  return authenticatedFetch(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request with authentication
 */
export async function put(url: string, data?: any, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<Response> {
  return authenticatedFetch(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request with authentication
 */
export async function del(url: string, options: Omit<FetchOptions, 'method'> = {}): Promise<Response> {
  return authenticatedFetch(url, { ...options, method: 'DELETE' });
}

/**
 * Helper function to handle API responses with proper error handling
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}
