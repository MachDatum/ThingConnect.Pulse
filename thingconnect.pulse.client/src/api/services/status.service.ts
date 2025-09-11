import { apiClient } from '../client';
import type { PagedLive, LiveStatusParams } from '../types';

export class StatusService {
  static async getLiveStatus(params: LiveStatusParams = {}): Promise<PagedLive> {
    const searchParams = new URLSearchParams();

    if (params.group) {
      searchParams.append('group', params.group);
    }

    if (params.search) {
      searchParams.append('search', params.search);
    }

    const queryString = searchParams.toString();
    const url = `/api/status/live${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<PagedLive>(url);
  }
}
