import { apiClient } from '../client';
import type {
  UserInfo,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeRoleRequest,
  ResetPasswordRequest,
  UsersListParams,
  PagedResult,
} from '../types';

export class UserManagementService {
  /**
   * Get paginated list of users with optional filtering
   */
  static async getUsers(params: UsersListParams = {}): Promise<PagedResult<UserInfo>> {
    const searchParams = new URLSearchParams();

    if (params.page) {
      searchParams.append('page', params.page.toString());
    }

    if (params.pageSize) {
      searchParams.append('pageSize', params.pageSize.toString());
    }

    if (params.search) {
      searchParams.append('search', params.search);
    }

    if (params.role) {
      searchParams.append('role', params.role);
    }

    if (params.isActive !== undefined) {
      searchParams.append('isActive', params.isActive.toString());
    }

    const queryString = searchParams.toString();
    const url = `/api/UserManagement${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<PagedResult<UserInfo>>(url);
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(id: string): Promise<UserInfo> {
    return apiClient.get<UserInfo>(`/api/UserManagement/${encodeURIComponent(id)}`);
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(request: CreateUserRequest): Promise<UserInfo> {
    return apiClient.post<UserInfo>('/api/UserManagement', request);
  }

  /**
   * Update user details
   */
  static async updateUser(id: string, request: UpdateUserRequest): Promise<UserInfo> {
    return apiClient.put<UserInfo>(`/api/UserManagement/${encodeURIComponent(id)}`, request);
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/UserManagement/${encodeURIComponent(id)}`);
  }

  /**
   * Change user role
   */
  static async changeUserRole(id: string, request: ChangeRoleRequest): Promise<UserInfo> {
    return apiClient.patch<UserInfo>(`/api/UserManagement/${encodeURIComponent(id)}/role`, request);
  }

  /**
   * Reset user password (admin only)
   */
  static async resetUserPassword(id: string, request: ResetPasswordRequest): Promise<void> {
    return apiClient.post<void>(`/api/UserManagement/${encodeURIComponent(id)}/reset-password`, request);
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(id: string, isActive: boolean): Promise<UserInfo> {
    return apiClient.patch<UserInfo>(`/api/UserManagement/${encodeURIComponent(id)}`, {
      isActive,
    });
  }
}