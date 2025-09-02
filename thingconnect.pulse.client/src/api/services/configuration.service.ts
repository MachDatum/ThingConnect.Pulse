import { apiClient } from '../client';
import type { ConfigurationVersion, ConfigurationApplyResponse } from '../types';

export class ConfigurationService {
  /**
   * Get list of all configuration versions
   */
  async getVersions(): Promise<ConfigurationVersion[]> {
    return apiClient.get<ConfigurationVersion[]>('/api/configuration/versions');
  }

  /**
   * Get specific configuration version by ID
   */
  async getVersion(id: string): Promise<ConfigurationVersion> {
    return apiClient.get<ConfigurationVersion>(`/api/configuration/versions/${id}`);
  }

  /**
   * Download configuration version as YAML file
   */
  async downloadVersion(id: string, filename?: string): Promise<void> {
    const version = await this.getVersion(id);
    const downloadFilename = filename || `configuration-${version.applied_ts.slice(0, 10)}.yaml`;
    return apiClient.download(`/api/configuration/versions/${id}`, downloadFilename);
  }

  /**
   * Apply new configuration from YAML content
   */
  async applyConfiguration(yamlContent: string): Promise<ConfigurationApplyResponse> {
    return apiClient.post<ConfigurationApplyResponse>('/api/configuration/apply', yamlContent, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  /**
   * Validate configuration without applying
   */
  async validateConfiguration(yamlContent: string): Promise<{ isValid: boolean; errors?: string[] }> {
    try {
      // Use dry-run parameter to validate without applying
      const response = await apiClient.post<ConfigurationApplyResponse>('/api/configuration/apply?dry-run=true', yamlContent, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      return { isValid: true, ...response };
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

export const configurationService = new ConfigurationService();