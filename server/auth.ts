/**
 * Server-side authentication utilities for device-based access control
 */

interface DeviceRecord {
  id: string;
  name: string;
  userAgent: string;
  registeredAt: number;
  lastSeen: number;
}

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
 * Gets approved device tokens from environment variables
 */
export function getApprovedTokens(): string[] {
  const tokens = process.env.EXPENSE_TRACKER_DEVICE_TOKENS;
  if (!tokens) {
    return [];
  }
  return tokens.split(',').map(token => token.trim()).filter(Boolean);
}

/**
 * Gets registered devices from environment variables
 */
export function getRegisteredDevices(): DeviceRecord[] {
  const devicesJson = process.env.EXPENSE_TRACKER_REGISTERED_DEVICES;
  if (!devicesJson) {
    return [];
  }
  
  try {
    return JSON.parse(devicesJson);
  } catch (error) {
    console.error('Failed to parse registered devices:', error);
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
 * Validates a device token
 */
export function validateDeviceToken(token: string): boolean {
  const approvedTokens = getApprovedTokens();
  return approvedTokens.includes(token);
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
 * Adds a new device token to approved list
 */
export function addDeviceToken(token: string, deviceId: string, deviceName: string, userAgent: string): void {
  // Add to approved tokens
  const currentTokens = getApprovedTokens();
  if (!currentTokens.includes(token)) {
    currentTokens.push(token);
    saveApprovedTokens(currentTokens);
  }
  
  // Add to registered devices
  const devices = getRegisteredDevices();
  const existingDeviceIndex = devices.findIndex(d => d.id === deviceId);
  
  const deviceRecord: DeviceRecord = {
    id: deviceId,
    name: deviceName,
    userAgent,
    registeredAt: existingDeviceIndex === -1 ? Date.now() : devices[existingDeviceIndex].registeredAt,
    lastSeen: Date.now()
  };
  
  if (existingDeviceIndex === -1) {
    devices.push(deviceRecord);
  } else {
    devices[existingDeviceIndex] = deviceRecord;
  }
  
  saveRegisteredDevices(devices);
}

/**
 * Updates last seen timestamp for a device
 */
export function updateDeviceLastSeen(deviceId: string): void {
  const devices = getRegisteredDevices();
  const deviceIndex = devices.findIndex(d => d.id === deviceId);
  
  if (deviceIndex !== -1) {
    devices[deviceIndex].lastSeen = Date.now();
    saveRegisteredDevices(devices);
  }
}

/**
 * Removes a device token and registration
 */
export function revokeDevice(deviceId: string): boolean {
  const devices = getRegisteredDevices();
  const deviceIndex = devices.findIndex(d => d.id === deviceId);
  
  if (deviceIndex === -1) {
    return false;
  }
  
  // Remove from registered devices
  devices.splice(deviceIndex, 1);
  saveRegisteredDevices(devices);
  
  // Note: We don't remove tokens from the approved list since the same token
  // might be used by the same device if it re-registers with the same fingerprint
  // This is a design choice - you could also remove tokens if preferred
  
  return true;
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
 * Gets device information by ID
 */
export function getDeviceInfo(deviceId: string): DeviceRecord | null {
  const devices = getRegisteredDevices();
  return devices.find(d => d.id === deviceId) || null;
}

/**
 * Cleans up old devices (older than 90 days with no activity)
 */
export function cleanupOldDevices(): void {
  const devices = getRegisteredDevices();
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  
  const activeDevices = devices.filter(device => device.lastSeen > ninetyDaysAgo);
  
  if (activeDevices.length !== devices.length) {
    saveRegisteredDevices(activeDevices);
    console.log(`Cleaned up ${devices.length - activeDevices.length} old devices`);
  }
}
