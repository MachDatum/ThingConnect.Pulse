import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiError } from './types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
      withCredentials: true, // Enable cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Add timestamp for debugging
        if (import.meta.env.DEV) {
          console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error: AxiosError) => {
        if (import.meta.env.DEV) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(new Error(`Request failed: ${error.message}`));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => {
        if (import.meta.env.DEV) {
          console.log(
            `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
          );
        }
        return response;
      },
      (error: AxiosError) => {
        if (import.meta.env.DEV) {
          console.error('❌ Response Error:', error.response?.status, error.message);
        }

        // Transform error to our ApiError format
        const apiError: ApiError = {
          message:
            (error.response?.data as { message?: string })?.message ||
            error.message ||
            'An unexpected error occurred',
          code: error.response?.status?.toString() || error.code,
          details: error.response?.data as Record<string, unknown>,
        };

        return Promise.reject(new Error(JSON.stringify(apiError)));
      }
    );
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // HTTP method shortcuts
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Download method for CSV exports
  async download(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const response = await this.client.request({
      ...config,
      method: 'GET',
      url,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data as BlobPart], {
      type: response.headers['content-type'] as string,
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or multiple instances if needed
export { ApiClient };
