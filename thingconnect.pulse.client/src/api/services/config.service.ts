import { apiClient } from '../client';
import type { ConfigVersion, ConfigApplyRequest, ConfigApplyResponse } from '../types';

export class ConfigService {
  /**
   * Get list of all configuration versions
   */
  async getVersions(): Promise<ConfigVersion[]> {
    return apiClient.get<ConfigVersion[]>('/api/config/versions');
  }

  /**
   * Get specific configuration version by ID
   */
  async getVersion(id: string): Promise<ConfigVersion> {
    return apiClient.get<ConfigVersion>(`/api/config/versions/${id}`);
  }

  /**
   * Download configuration version as YAML file
   */
  async downloadVersion(id: string, filename?: string): Promise<void> {
    const version = await this.getVersion(id);
    const downloadFilename = filename || `config-${version.applied_ts.slice(0, 10)}.yaml`;
    return apiClient.download(`/api/config/versions/${id}`, downloadFilename);
  }

  /**
   * Apply new configuration from YAML content
   */
  async applyConfig(yamlContent: string): Promise<ConfigApplyResponse> {
    return apiClient.post<ConfigApplyResponse>('/api/config/apply', yamlContent, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  /**
   * Validate configuration without applying
   */
  async validateConfig(yamlContent: string): Promise<{ isValid: boolean; errors?: string[] }> {
    try {
      // Use dry-run parameter to validate without applying
      const response = await apiClient.post<ConfigApplyResponse>('/api/config/apply?dry-run=true', yamlContent, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      return { isValid: true };
    } catch (error) {
      // Parse validation errors from API response
      try {
        const apiError = JSON.parse((error as Error).message);
        return {
          isValid: false,
          errors: Array.isArray(apiError.details?.errors) ? apiError.details.errors : [apiError.message],
        };
      } catch {
        return {
          isValid: false,
          errors: [(error as Error).message],
        };
      }
    }
  }
}

export const configService = new ConfigService();