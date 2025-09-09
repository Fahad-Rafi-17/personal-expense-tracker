import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Smartphone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';

export function AuthScreen() {
  const { login, isLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter your master password');
      return;
    }

    const result = await login(password);
    
    if (!result.success) {
      setAttempts(prev => prev + 1);
      setError(result.error || 'Authentication failed');
      setPassword('');
      
      // Add delay after multiple failed attempts
      if (attempts >= 2) {
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const isLocked = attempts >= 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Secure Access Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your master password to access your personal expense tracker
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Device Registration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  Device Registration
                </p>
                <p className="text-blue-700">
                  This device will be registered for future automatic access upon successful authentication.
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {attempts > 0 && attempts < 5 && (
                  <span className="block mt-1 text-sm">
                    Attempts: {attempts}/5
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Lockout Alert */}
          {isLocked && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Too many failed attempts. Please wait 5 minutes before trying again.
              </AlertDescription>
            </Alert>
          )}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Master Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  disabled={isLoading || isLocked}
                  className="pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isLocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isLocked || !password.trim()}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Expense Tracker'
              )}
            </Button>
          </form>

          {/* Security Info */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Your financial data is protected by device-based access control
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <span>🔒 Encrypted Storage</span>
              <span>📱 Device Registration</span>
              <span>🛡️ Secure Access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
