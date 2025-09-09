import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { getAuthStatus, getDeviceId } from '@/lib/auth';

interface RegisteredDevice {
  id: string;
  name: string;
  lastSeen: number;
  isCurrentDevice: boolean;
  userAgent: string;
}

function DeviceIcon({ deviceName }: { deviceName: string }) {
  const name = deviceName.toLowerCase();
  
  if (name.includes('phone') || name.includes('mobile')) {
    return <Smartphone className="w-5 h-5" />;
  }
  if (name.includes('tablet') || name.includes('ipad')) {
    return <Tablet className="w-5 h-5" />;
  }
  return <Monitor className="w-5 h-5" />;
}

export function DeviceManagement() {
  const { logout } = useAuth();
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);

  const currentDeviceId = getDeviceId();
  const authStatus = getAuthStatus();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/devices');
      
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
      
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (err) {
      setError('Failed to load registered devices');
      console.error('Error fetching devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    if (deviceId === currentDeviceId) {
      // Revoking current device - this will log out the user
      const confirmed = window.confirm(
        'This will revoke access for your current device and log you out. Are you sure?'
      );
      if (!confirmed) return;
    }

    try {
      setRevoking(deviceId);
      const response = await fetch('/api/auth/revoke-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId })
      });

      if (!response.ok) {
        throw new Error('Failed to revoke device');
      }

      if (deviceId === currentDeviceId) {
        // Current device was revoked, log out
        logout();
      } else {
        // Refresh the device list
        await fetchDevices();
      }
    } catch (err) {
      setError('Failed to revoke device access');
      console.error('Error revoking device:', err);
    } finally {
      setRevoking(null);
    }
  };

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Device Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Device Management</span>
        </CardTitle>
        <CardDescription>
          Manage devices that have access to your expense tracker
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Device Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DeviceIcon deviceName={authStatus.deviceName || 'Unknown'} />
              <div>
                <p className="font-medium text-blue-900">
                  {authStatus.deviceName || 'Current Device'}
                </p>
                <p className="text-sm text-blue-700">
                  Last verified: {formatLastSeen(authStatus.lastVerified)}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Current
            </span>
          </div>
        </div>

        {/* Registered Devices List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">All Registered Devices</h4>
          
          {devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No registered devices found</p>
              <p className="text-sm">Devices will appear here after authentication</p>
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className={`border rounded-lg p-4 ${
                  device.isCurrentDevice 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DeviceIcon deviceName={device.name} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {device.name}
                        {device.isCurrentDevice && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Last seen: {formatLastSeen(device.lastSeen)}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-xs">
                        {device.userAgent}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeDevice(device.id)}
                    disabled={revoking === device.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {revoking === device.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {revoking === device.id ? 'Revoking...' : 'Revoke'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Note:</strong> Revoking a device will immediately remove its access. 
            The device will need to re-authenticate with the master password to regain access.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
