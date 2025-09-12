import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  authService,
  type UserInfo,
  type LoginRequest,
  type RegisterRequest,
} from '../services/authService';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setupRequired: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  const isAuthenticated = user !== null;

  const checkSession = async () => {
    try {
      setIsLoading(true);
      const sessionUser = await authService.getSession();
      setUser(sessionUser);

      // If no user, check if setup is required
      if (!sessionUser) {
        const needsSetup = await authService.isSetupRequired();
        setSetupRequired(needsSetup);
      } else {
        setSetupRequired(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
      // Check setup requirement on session error
      try {
        const needsSetup = await authService.isSetupRequired();
        setSetupRequired(needsSetup);
      } catch (setupError) {
        console.error('Error checking setup requirement:', setupError);
        setSetupRequired(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      setSetupRequired(false);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      setSetupRequired(false);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // After logout, check if setup is needed
      try {
        const needsSetup = await authService.isSetupRequired();
        setSetupRequired(needsSetup);
      } catch (error) {
        console.error('Error checking setup after logout:', error);
      }
    }
  };

  const refreshSession = async () => {
    await checkSession();
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    setupRequired,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
