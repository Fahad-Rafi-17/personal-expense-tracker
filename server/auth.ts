/**
 * Server-side authentication utilities for device-based access control
 */

import { authStorage } from "./auth-storage.js";

interface DeviceRecord {
  id: string;
  name: string;
  userAgent: string;
  registeredAt: number;
  lastSeen: number;
}

// In-memory storage for tokens during the session (since serverless doesn't persist env changes)
const sessionTokens = new Set<string>();
const sessionDevices = new Map<string, DeviceRecord>();

// Global token cache to improve performance and handle serverless environment
let tokenCache: { tokens: string[], lastUpdated: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Track tokens added during this function lifecycle
const lifecycleTokens = new Set<string>();

/**
 * Gets the master password from environment variables
 */
export function getMasterPassword(): string {
  const password = process.env.EXPENSE_TRACKER_MASTER_PASSWORD;
  if (!password) {
    throw new Error('EXPENSE_TRACKER_MASTER_PASSWORD environment variable is not set');
  }
  return password;
}

/**
 * Gets approved device tokens from environment variables and session
 */
export function getApprovedTokens(): string[] {
  console.log('🔧 [getApprovedTokens] Getting approved tokens...');
  
  // Check cache first
  const now = Date.now();
  if (tokenCache && (now - tokenCache.lastUpdated) < CACHE_DURATION) {
    console.log('🔧 [getApprovedTokens] Using cached tokens:', tokenCache.tokens.length);
    
    // Always include lifecycle tokens (tokens added in this function execution)
    const allTokens = [...tokenCache.tokens];
    const lifecycleTokenArray = Array.from(lifecycleTokens);
    lifecycleTokenArray.forEach(token => {
      if (!allTokens.includes(token)) {
        allTokens.push(token);
      }
    });
    
    console.log('🔧 [getApprovedTokens] Total tokens (cached + lifecycle):', allTokens.length);
    return allTokens;
  }

  console.log('🔧 [getApprovedTokens] Cache miss or expired, reading from environment...');
  
  const tokens = process.env.EXPENSE_TRACKER_DEVICE_TOKENS;
  let persistentTokens: string[] = [];
  
  if (tokens) {
    persistentTokens = tokens.split(',').map(token => token.trim()).filter(Boolean);
  }
  
  console.log('🔧 [getApprovedTokens] Persistent tokens:', persistentTokens.length);
  
  // Merge with session tokens
  const sessionTokenArray = Array.from(sessionTokens);
  const allTokens = [...persistentTokens];
  
  // Add session tokens that aren't already in persistent storage
  sessionTokenArray.forEach(sessionToken => {
    if (!allTokens.includes(sessionToken)) {
      allTokens.push(sessionToken);
    }
  });
  
  // Add lifecycle tokens
  const lifecycleTokenArray = Array.from(lifecycleTokens);
  lifecycleTokenArray.forEach(token => {
    if (!allTokens.includes(token)) {
      allTokens.push(token);
    }
  });
  
  console.log('🔧 [getApprovedTokens] Session tokens:', sessionTokenArray.length);
  console.log('🔧 [getApprovedTokens] Lifecycle tokens:', lifecycleTokenArray.length);
  console.log('🔧 [getApprovedTokens] Total tokens:', allTokens.length);
  
  // Update cache
  tokenCache = {
    tokens: [...persistentTokens, ...sessionTokenArray], // Don't cache lifecycle tokens
    lastUpdated: now
  };
  
  return allTokens;
}

/**
 * Gets registered devices from database storage
 */
export async function getRegisteredDevices(): Promise<DeviceRecord[]> {
  console.log('📱 [getRegisteredDevices] Getting devices from database...');
  
  try {
    const devices = await authStorage.getRegisteredDevices();
    
    // Convert database format to DeviceRecord format
    const deviceRecords: DeviceRecord[] = devices.map(device => ({
      id: device.device_id,
      name: device.device_name,
      userAgent: device.user_agent || '',
      registeredAt: new Date(device.created_at).getTime(),
      lastSeen: new Date(device.last_seen).getTime()
    }));
    
    console.log('📱 [getRegisteredDevices] Found', deviceRecords.length, 'devices');
    return deviceRecords;
  } catch (error) {
    console.error('📱 [getRegisteredDevices] Error getting devices:', error);
    return [];
  }
}

/**
 * Saves approved tokens to environment variable format
 * Note: In production, you'll need to update the Vercel environment variable
 */
export function saveApprovedTokens(tokens: string[]): void {
  const tokenString = tokens.join(',');
  process.env.EXPENSE_TRACKER_DEVICE_TOKENS = tokenString;
  
  // In development, this will update the process environment
  // In production on Vercel, you'll need to update the environment variable manually
  console.log('Updated device tokens. In production, update EXPENSE_TRACKER_DEVICE_TOKENS environment variable to:', tokenString);
}

/**
 * Saves registered devices to environment variable format
 */
export function saveRegisteredDevices(devices: DeviceRecord[]): void {
  const devicesJson = JSON.stringify(devices);
  process.env.EXPENSE_TRACKER_REGISTERED_DEVICES = devicesJson;
  
  console.log('Updated registered devices. In production, update EXPENSE_TRACKER_REGISTERED_DEVICES environment variable.');
}

/**
 * Validates a device token using database storage
 */
export async function validateDeviceToken(token: string): Promise<boolean> {
  console.log('🔍 [validateDeviceToken] Validating token:', token.substring(0, 20) + '...');
  
  if (!token || typeof token !== 'string') {
    console.log('🔍 [validateDeviceToken] Invalid token format');
    return false;
  }

  try {
    // Check database storage for the token
    const isValid = await authStorage.validateDeviceToken(token);
    console.log('🔍 [validateDeviceToken] Database validation result:', isValid);
    return isValid;
  } catch (error) {
    console.error('🔍 [validateDeviceToken] Error during validation:', error);
    return false;
  }
}

/**
 * Generates a new device token
 */
export function generateDeviceToken(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = Array.from(
    { length: 32 }, 
    () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  
  return `dt_${timestamp}_${randomBytes}`;
}

/**
 * Adds a new device token using database storage
 */
export async function addDeviceToken(token: string, deviceId: string, deviceName: string, userAgent: string): Promise<void> {
  console.log('🔧 [addDeviceToken] Adding token:', token.substring(0, 20) + '...');
  console.log('🔧 [addDeviceToken] Device info:', { deviceId, deviceName, userAgent: userAgent?.substring(0, 50) + '...' });
  
  try {
    // Store the token in the database
    await authStorage.storeDeviceToken(token, deviceId, deviceName, userAgent);
    console.log('🔧 [addDeviceToken] Token stored in database successfully');
  } catch (error) {
    console.error('🔧 [addDeviceToken] Error storing token:', error);
    throw error;
  }
}

/**
 * Updates last seen timestamp for a device using database storage
 */
export async function updateDeviceLastSeen(deviceId: string): Promise<void> {
  console.log('🔄 [updateDeviceLastSeen] Updating last seen for device:', deviceId);
  
  try {
    await authStorage.updateDeviceLastSeen(deviceId);
  } catch (error) {
    console.error('🔄 [updateDeviceLastSeen] Error updating last seen:', error);
  }
}

/**
 * Removes a device token and registration using database storage
 */
export async function revokeDevice(deviceId: string): Promise<boolean> {
  console.log('🚫 [revokeDevice] Revoking device:', deviceId);
  
  try {
    return await authStorage.revokeDevice(deviceId);
  } catch (error) {
    console.error('🚫 [revokeDevice] Error revoking device:', error);
    return false;
  }
}

/**
 * Verifies master password
 */
export function verifyMasterPassword(password: string): boolean {
  try {
    const masterPassword = getMasterPassword();
    return password === masterPassword;
  } catch (error) {
    console.error('Master password verification failed:', error);
    return false;
  }
}

/**
 * Gets device information by ID from database storage
 */
export async function getDeviceInfo(deviceId: string): Promise<DeviceRecord | null> {
  console.log('ℹ️ [getDeviceInfo] Getting device info for:', deviceId);
  
  try {
    const devices = await getRegisteredDevices();
    const device = devices.find(d => d.id === deviceId) || null;
    console.log('ℹ️ [getDeviceInfo] Device found:', !!device);
    return device;
  } catch (error) {
    console.error('ℹ️ [getDeviceInfo] Error getting device info:', error);
    return null;
  }
}

/**
 * Cleans up old devices using database storage
 */
export async function cleanupOldDevices(): Promise<void> {
  console.log('🧹 [cleanupOldDevices] Starting cleanup...');
  
  try {
    // Use the database cleanup method which is more efficient
    const cleanedCount = await authStorage.cleanupOldDevices(90);
    console.log('🧹 [cleanupOldDevices] Cleaned up', cleanedCount, 'old devices');
  } catch (error) {
    console.error('🧹 [cleanupOldDevices] Error during cleanup:', error);
  }
}
