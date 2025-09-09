import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuthStatus,
  getDeviceToken,
  validateDeviceToken,
  authenticateWithPassword,
  clearAuthData,
  updateLastVerified,
  isSessionValid
} from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  deviceName: string | null;
  lastVerified: number;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [lastVerified, setLastVerified] = useState(0);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Checking authentication...');
      
      // Check if session is valid locally first
      if (!isSessionValid()) {
        console.log('🔄 Session invalid locally');
        setIsAuthenticated(false);
        return false;
      }

      const token = getDeviceToken();
      console.log('🔄 Current token:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        console.log('🔄 No token found');
        setIsAuthenticated(false);
        return false;
      }

      // Validate with server
      console.log('🔄 Validating token with server...');
      const isValid = await validateDeviceToken(token);
      console.log('🔄 Token validation result:', isValid);
      
      if (isValid) {
        const authStatus = getAuthStatus();
        console.log('🔄 Auth status:', authStatus);
        setIsAuthenticated(true);
        setDeviceName(authStatus.deviceName);
        setLastVerified(authStatus.lastVerified);
        updateLastVerified();
        return true;
      } else {
        // Token is invalid, clear auth data
        console.log('🔄 Token invalid, clearing auth data');
        clearAuthData();
        setIsAuthenticated(false);
        setDeviceName(null);
        setLastVerified(0);
        return false;
      }
    } catch (error) {
      console.error('🔄 Auth check failed:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const result = await authenticateWithPassword(password);
      
      if (result.success) {
        const authStatus = getAuthStatus();
        setIsAuthenticated(true);
        setDeviceName(authStatus.deviceName);
        setLastVerified(authStatus.lastVerified);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setDeviceName(null);
    setLastVerified(0);
  };

  // Check authentication on mount and periodically
  useEffect(() => {
    checkAuth();

    // Set up periodic auth check (every 5 minutes)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuth();
      }
    }, 5 * 60 * 1000);

    // Listen for token invalidation events from API calls
    const handleTokenInvalid = () => {
      console.log('Token invalidated, clearing auth state');
      setIsAuthenticated(false);
      setDeviceName(null);
      setLastVerified(0);
      clearAuthData();
    };

    window.addEventListener('auth:token-invalid', handleTokenInvalid);

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth:token-invalid', handleTokenInvalid);
    };
  }, []);

  // Update auth status when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      const authStatus = getAuthStatus();
      setDeviceName(authStatus.deviceName);
      setLastVerified(authStatus.lastVerified);
    }
  }, [isAuthenticated]);

  const value = {
    isAuthenticated,
    isLoading,
    deviceName,
    lastVerified,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
