/**
 * Database-based authentication storage using Supabase
 */

import { supabase } from "./database.js";

export interface DatabaseDeviceToken {
  id: string;
  token: string;
  device_id: string;
  device_name: string;
  user_agent: string | null;
  created_at: string;
  last_seen: string;
  is_active: boolean;
}

export class AuthStorage {
  /**
   * Store a device token in the database
   */
  async storeDeviceToken(
    token: string, 
    deviceId: string, 
    deviceName: string, 
    userAgent: string
  ): Promise<void> {
    console.log('💾 [AuthStorage] Storing device token in database...');
    
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        token,
        device_id: deviceId,
        device_name: deviceName,
        user_agent: userAgent,
        last_seen: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'token'
      });

    if (error) {
      console.error('💾 [AuthStorage] Error storing device token:', error);
      throw new Error(`Failed to store device token: ${error.message}`);
    }

    console.log('💾 [AuthStorage] Device token stored successfully');
  }

  /**
   * Validate if a token exists and is active in the database
   */
  async validateDeviceToken(token: string): Promise<boolean> {
    console.log('🔍 [AuthStorage] Validating token in database:', token.substring(0, 20) + '...');
    
    const { data, error } = await supabase
      .from('device_tokens')
      .select('token, is_active')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No matching rows found
        console.log('🔍 [AuthStorage] Token not found in database');
        return false;
      }
      console.error('🔍 [AuthStorage] Error validating token:', error);
      return false;
    }

    const isValid = !!data;
    console.log('🔍 [AuthStorage] Database token validation result:', isValid);
    return isValid;
  }

  /**
   * Update the last seen timestamp for a device
   */
  async updateDeviceLastSeen(deviceId: string): Promise<void> {
    console.log('🔄 [AuthStorage] Updating last seen for device:', deviceId);
    
    const { error } = await supabase
      .from('device_tokens')
      .update({ 
        last_seen: new Date().toISOString() 
      })
      .eq('device_id', deviceId)
      .eq('is_active', true);

    if (error) {
      console.error('🔄 [AuthStorage] Error updating last seen:', error);
    }
  }

  /**
   * Get all registered devices
   */
  async getRegisteredDevices(): Promise<DatabaseDeviceToken[]> {
    console.log('📱 [AuthStorage] Getting registered devices from database...');
    
    const { data, error } = await supabase
      .from('device_tokens')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('📱 [AuthStorage] Error getting devices:', error);
      throw new Error(`Failed to get registered devices: ${error.message}`);
    }

    console.log('📱 [AuthStorage] Found', data?.length || 0, 'registered devices');
    return data || [];
  }

  /**
   * Revoke a device by setting it as inactive
   */
  async revokeDevice(deviceId: string): Promise<boolean> {
    console.log('🚫 [AuthStorage] Revoking device:', deviceId);
    
    const { error } = await supabase
      .from('device_tokens')
      .update({ is_active: false })
      .eq('device_id', deviceId);

    if (error) {
      console.error('🚫 [AuthStorage] Error revoking device:', error);
      return false;
    }

    console.log('🚫 [AuthStorage] Device revoked successfully');
    return true;
  }

  /**
   * Clean up old devices (older than specified days)
   */
  async cleanupOldDevices(daysOld: number = 90): Promise<number> {
    console.log('🧹 [AuthStorage] Cleaning up devices older than', daysOld, 'days');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const { data, error } = await supabase
      .from('device_tokens')
      .update({ is_active: false })
      .lt('last_seen', cutoffDate.toISOString())
      .eq('is_active', true)
      .select('id');

    if (error) {
      console.error('🧹 [AuthStorage] Error cleaning up devices:', error);
      return 0;
    }

    const cleanedCount = data?.length || 0;
    console.log('🧹 [AuthStorage] Cleaned up', cleanedCount, 'old devices');
    return cleanedCount;
  }

  /**
   * Get all valid tokens for validation purposes
   */
  async getAllValidTokens(): Promise<string[]> {
    console.log('🎫 [AuthStorage] Getting all valid tokens from database...');
    
    const { data, error } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('is_active', true);

    if (error) {
      console.error('🎫 [AuthStorage] Error getting tokens:', error);
      return [];
    }

    const tokens = data?.map(row => row.token) || [];
    console.log('🎫 [AuthStorage] Found', tokens.length, 'valid tokens');
    return tokens;
  }
}

// Create singleton instance
export const authStorage = new AuthStorage();
