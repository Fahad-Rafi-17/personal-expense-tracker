import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, Download, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DeviceManagement } from '@/components/device-management';
import { useAuth } from '@/contexts/auth-context';
import { transactionStorage } from '@/lib/storage';

export default function SettingsPage() {
  const { logout, deviceName, lastVerified } = useAuth();

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out? You will need to enter your master password to access this device again.');
    if (confirmed) {
      logout();
    }
  };

  const handleDownloadData = async () => {
    try {
      await transactionStorage.downloadCSV();
    } catch (error) {
      console.error('Failed to download data:', error);
      alert('Failed to download data. Please try again.');
    }
  };

  const formatLastVerified = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Current Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Current Session</span>
            </CardTitle>
            <CardDescription>
              Information about your current authenticated session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Device</label>
                <p className="text-sm text-gray-600">{deviceName || 'Unknown Device'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Verified</label>
                <p className="text-sm text-gray-600">
                  {lastVerified ? formatLastVerified(lastVerified) : 'Unknown'}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Session Status</h4>
                <p className="text-sm text-gray-600">You are currently signed in to this device</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Management */}
        <DeviceManagement />

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Manage and export your financial data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Export Transactions</h4>
                <p className="text-sm text-gray-600">Download all your transaction data as a CSV file</p>
              </div>
              <Button onClick={handleDownloadData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Security Actions</CardTitle>
            <CardDescription>
              Actions that affect your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-800">Log Out</h4>
                <p className="text-sm text-red-600">
                  Sign out of this device. You'll need your master password to sign back in.
                </p>
              </div>
              <Button onClick={handleLogout} variant="destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Security Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start space-x-3">
              <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Device-Based Access Control</p>
                <p>Your expense tracker uses device tokens for secure access. Each device must be authenticated once with your master password.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Automatic Token Validation</p>
                <p>Your device token is validated with each request to ensure continued security. Tokens are automatically updated to maintain access.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Privacy by Design</p>
                <p>Your financial data is protected by default. Only authenticated devices with valid tokens can access your information.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
