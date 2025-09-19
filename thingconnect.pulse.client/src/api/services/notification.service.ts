import { apiClient } from '../client';
import type { Notification, NotificationStats, MarkNotificationReadRequest } from '../types';

export class NotificationService {
  /**
   * Get active notifications for the current user
   */
  static async getNotifications(includeRead: boolean = false): Promise<Notification[]> {
    const searchParams = new URLSearchParams();

    if (includeRead) {
      searchParams.append('includeRead', 'true');
    }

    const queryString = searchParams.toString();
    const url = `/api/notification${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<Notification[]>(url);
  }

  /**
   * Mark a notification as read
   */
  static async markNotificationRead(notificationId: string): Promise<void> {
    const request: MarkNotificationReadRequest = { notificationId };
    return apiClient.post('/api/notification/mark-read', request);
  }

  /**
   * Mark a notification as shown (for tracking purposes)
   */
  static async markNotificationShown(notificationId: string): Promise<void> {
    return apiClient.post(`/api/notification/${notificationId}/mark-shown`, {});
  }

  /**
   * Get notification statistics and settings
   */
  static async getNotificationStats(): Promise<NotificationStats> {
    return apiClient.get<NotificationStats>('/api/notification/stats');
  }

  /**
   * Force refresh notifications from remote server (admin only)
   */
  static async forceRefreshNotifications(): Promise<void> {
    return apiClient.post('/api/notification/refresh', {});
  }
}