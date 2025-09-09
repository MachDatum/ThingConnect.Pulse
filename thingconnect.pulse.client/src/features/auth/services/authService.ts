import { apiClient } from '@/api/client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  /**
   * Login user with username and password
   */
  async login(credentials: LoginRequest): Promise<UserInfo> {
    return apiClient.post<UserInfo>('/api/auth/login', credentials);
  }

  /**
   * Register the first admin user (only available when no users exist)
   */
  async register(userData: RegisterRequest): Promise<UserInfo> {
    return apiClient.post<UserInfo>('/api/auth/register', userData);
  }

  /**
   * Check if the system needs initial setup
   */
  async isSetupRequired(): Promise<boolean> {
    return apiClient.get<boolean>('/api/auth/setup-required');
  }

  /**
   * Get current user session
   */
  async getSession(): Promise<UserInfo | null> {
    try {
      return await apiClient.get<UserInfo>('/api/auth/session');
    } catch (error) {
      // If 401, user is not authenticated
      return null;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  }

  /**
   * Change current user's password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/change-password', passwordData);
  }
}

export const authService = new AuthService();