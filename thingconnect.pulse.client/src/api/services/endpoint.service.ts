import { apiClient } from '../client';
import type { EndpointDetail, EndpointDetailParams, PagedLive, LiveStatusItem } from '../types';

export class EndpointService {
  static async getEndpointDetail({ id }: EndpointDetailParams): Promise<EndpointDetail> {
    try {
      // First try the dedicated endpoint detail API
      const url = `/api/endpoints/${id}`;
      return await apiClient.get<EndpointDetail>(url);
    } catch {
      // Fallback: Get endpoint data from live status API
      console.warn('Endpoint detail API not available, falling back to live status data');

      const liveData = await apiClient.get<PagedLive>('/api/status/live');
      const endpointItem = liveData.items.find((item: LiveStatusItem) => item.endpoint.id === id);

      if (!endpointItem) {
        throw new Error(`Endpoint ${id} not found`);
      }

      // Convert live status to endpoint detail format
      return {
        endpoint: endpointItem.endpoint,
        recent: [
          {
            ts: endpointItem.lastChangeTs,
            status: endpointItem.status === 'flapping' ? 'down' : endpointItem.status,
            rttMs: endpointItem.rttMs,
            error: null,
          },
        ],
        outages: [],
      };
    }
  }
}
