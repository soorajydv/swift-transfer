import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthUser } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'remitpro_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { user: storedUser, token } = JSON.parse(stored);
        if (storedUser && token) {
          setUser(storedUser);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    const response = await authApi.requestOtp(email);
    return {
      success: response.success,
      error: response.error,
    };
  }, []);

  const login = useCallback(async (email: string, otp: string) => {
    const response = await authApi.verifyOtp(email, otp);
    
    if (response.success && response.data) {
      setUser(response.data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response.data));
      return { success: true };
    }
    
    return { success: false, error: response.error };
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
