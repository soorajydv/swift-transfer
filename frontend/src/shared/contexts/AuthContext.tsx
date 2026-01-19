import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthUser } from '@/shared/types';
import AuthService from '@/modules/auth/services/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for persisted auth state on mount
  useEffect(() => {
    const persistedAuth = localStorage.getItem('auth');
    if (persistedAuth) {
      try {
        const authData = JSON.parse(persistedAuth);
        setUser(authData.user);
        console.log('🔄 Restored auth state from localStorage:', authData.user.email);
      } catch (error) {
        console.error('Error parsing persisted auth:', error);
        localStorage.removeItem('auth');
      }
    } else {
      console.log('📭 No persisted auth state found');
    }
    setIsLoading(false);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await AuthService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      // User not authenticated or token expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    try {
      const response = await AuthService.requestOtp(email);
      return {
        success: response.success,
        error: response.error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send OTP',
      };
    }
  }, []);

  const login = useCallback(async (email: string, otp: string) => {
    try {
      const response = await AuthService.verifyOtp(email, otp);

      if (response.success && response.data) {
        setUser(response.data.user);
        // Persist auth state to localStorage
        localStorage.setItem('auth', JSON.stringify({
          user: response.data.user,
          timestamp: Date.now()
        }));
        console.log('✅ Login successful, auth state persisted');
        return { success: true };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth');
      console.log('👋 Logout successful, auth state cleared');
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await AuthService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true };
      } else {
        // If profile request fails, user is not authenticated
        setUser(null);
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      console.error('Failed to refresh profile:', error);
      setUser(null);
      return { success: false, error: error.message };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        requestOtp,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
