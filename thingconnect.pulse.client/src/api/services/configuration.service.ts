import { apiClient } from '../client';
import type {
  ConfigurationVersion,
  ConfigurationApplyResponse,
  ValidationErrorsDto,
  ValidationError,
} from '../types';

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
    const downloadFilename = filename || `configuration-${id}.yaml`;
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
   * Get current active configuration as YAML content
   */
  async getCurrentConfiguration(): Promise<string> {
    return apiClient.get<string>('/api/configuration/current', {
      headers: {
        Accept: 'text/plain',
      },
    });
  }

  /**
   * Validate configuration without applying
   */
  async validateConfiguration(
    yamlContent: string
  ): Promise<{ isValid: boolean; errors?: ValidationError[] }> {
    try {
      // Use dryRun parameter to validate without applying
      await apiClient.post<ConfigurationApplyResponse>(
        '/api/configuration/apply?dryRun=true',
        yamlContent,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
      return { isValid: true };
    } catch (error) {
      // Parse validation errors from API response
      try {
        const apiError = JSON.parse((error as Error).message);

        // The actual ValidationErrorsDto is in apiError.details, not the root
        const errorData = apiError.details || apiError;

        // Handle ValidationErrorsDto structure
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationDto = errorData as ValidationErrorsDto;
          return {
            isValid: false,
            errors: validationDto.errors,
          };
        }

        // Create a single error for other cases
        return {
          isValid: false,
          errors: [
            {
              path: '',
              message: errorData.message || apiError.message || 'Validation failed',
              value: null,
            },
          ],
        };
      } catch {
        return {
          isValid: false,
          errors: [
            {
              path: '',
              message: (error as Error).message,
              value: null,
            },
          ],
        };
      }
    }
  }
}

export const configurationService = new ConfigurationService();
