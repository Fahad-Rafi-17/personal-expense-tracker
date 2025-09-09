/**
 * Device-based authentication utilities for Personal Expense Tracker
 * Provides secure access control using device tokens and master password
 */

const STORAGE_KEYS = {
  DEVICE_TOKEN: 'expense_tracker_device_token',
  DEVICE_ID: 'expense_tracker_device_id',
  AUTH_STATUS: 'expense_tracker_auth_status'
} as const;

interface DeviceInfo {
  userAgent: string;
  language: string;
  timezone: string;
  screen: string;
  timestamp: number;
}

interface AuthStatus {
  isAuthenticated: boolean;
  deviceId: string | null;
  lastVerified: number;
  deviceName: string | null;
}

/**
 * Generates a unique device identifier based on browser characteristics
 */
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const deviceInfo: DeviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timestamp: Date.now()
  };
  
  const fingerprint = btoa(JSON.stringify(deviceInfo)).slice(0, 32);
  return fingerprint;
}

/**
 * Generates a cryptographically secure device token
 */
export function generateDeviceToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const timestamp = Date.now().toString(36);
  const randomPart = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `dt_${timestamp}_${randomPart}`;
}

/**
 * Gets a human-readable device name based on user agent
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  // Mobile devices
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) {
    if (/Mobile/i.test(ua)) return 'Android Phone';
    return 'Android Tablet';
  }
  
  // Desktop browsers
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) return 'Chrome Browser';
  if (/Firefox/i.test(ua)) return 'Firefox Browser';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari Browser';
  if (/Edge/i.test(ua)) return 'Edge Browser';
  
  // Operating systems
  if (/Windows/i.test(ua)) return 'Windows Computer';
  if (/Mac/i.test(ua)) return 'Mac Computer';
  if (/Linux/i.test(ua)) return 'Linux Computer';
  
  return 'Unknown Device';
}

/**
 * Stores device token in localStorage
 */
export function storeDeviceToken(token: string): void {
  const deviceId = generateDeviceFingerprint();
  const deviceName = getDeviceName();
  
  localStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  
  const authStatus: AuthStatus = {
    isAuthenticated: true,
    deviceId,
    lastVerified: Date.now(),
    deviceName
  };
  
  localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, JSON.stringify(authStatus));
}

/**
 * Retrieves stored device token
 */
export function getDeviceToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
}

/**
 * Retrieves stored device ID
 */
export function getDeviceId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
}

/**
 * Gets current authentication status
 */
export function getAuthStatus(): AuthStatus {
  const stored = localStorage.getItem(STORAGE_KEYS.AUTH_STATUS);
  if (!stored) {
    return {
      isAuthenticated: false,
      deviceId: null,
      lastVerified: 0,
      deviceName: null
    };
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return {
      isAuthenticated: false,
      deviceId: null,
      lastVerified: 0,
      deviceName: null
    };
  }
}

/**
 * Clears all authentication data (logout)
 */
export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.DEVICE_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
  localStorage.removeItem(STORAGE_KEYS.AUTH_STATUS);
}

/**
 * Validates device token with server
 */
export async function validateDeviceToken(token: string): Promise<boolean> {
  try {
    console.log('🔍 Validating token:', token.substring(0, 20) + '...');
    
    const response = await fetch('/api/auth/validate-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token,
        deviceId: getDeviceId(),
        deviceName: getDeviceName()
      })
    });
    
    console.log('🔍 Validation response status:', response.status);
    const result = await response.json();
    console.log('🔍 Validation result:', result);
    
    return response.ok && result.valid === true;
  } catch (error) {
    console.error('🔍 Token validation failed:', error);
    return false;
  }
}

/**
 * Authenticates with master password
 */
export async function authenticateWithPassword(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const deviceId = generateDeviceFingerprint();
    const deviceName = getDeviceName();
    
    console.log('🔐 Attempting authentication...', { deviceId, deviceName });
    
    const response = await fetch('/api/auth/master-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        password,
        deviceId,
        deviceName
      })
    });
    
    console.log('🔐 Auth response status:', response.status);
    const result = await response.json();
    console.log('🔐 Auth response data:', result);
    
    if (response.ok && result.success) {
      // Store the new device token
      if (result.token) {
        console.log('🔐 Storing device token:', result.token.substring(0, 20) + '...');
        storeDeviceToken(result.token);
      }
      return { success: true, token: result.token };
    } else {
      console.log('🔐 Auth failed:', result.error);
      return { success: false, error: result.error || 'Authentication failed' };
    }
  } catch (error) {
    console.error('🔐 Password authentication failed:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

/**
 * Checks if current session is valid (token exists and not expired)
 */
export function isSessionValid(): boolean {
  const authStatus = getAuthStatus();
  const token = getDeviceToken();
  
  if (!authStatus.isAuthenticated || !token) {
    return false;
  }
  
  // Check if token is older than 30 days (optional expiration)
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const isExpired = (Date.now() - authStatus.lastVerified) > thirtyDaysMs;
  
  return !isExpired;
}

/**
 * Updates last verified timestamp
 */
export function updateLastVerified(): void {
  const authStatus = getAuthStatus();
  if (authStatus.isAuthenticated) {
    authStatus.lastVerified = Date.now();
    localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, JSON.stringify(authStatus));
  }
}
