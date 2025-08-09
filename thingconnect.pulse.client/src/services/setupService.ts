import axios from 'axios';

const API_BASE_URL = '/api';

export interface SetupStatus {
  isSetupRequired: boolean;
  hasAdminUser: boolean;
}

class SetupService {
  async checkSetupStatus(): Promise<SetupStatus> {
    try {
      const response = await axios.get<SetupStatus>(`${API_BASE_URL}/setup/status`);
      return response.data;
    } catch {
      return {
        isSetupRequired: true,
        hasAdminUser: false,
      };
    }
  }

  async completeSetup(): Promise<void> {
    await axios.post(`${API_BASE_URL}/setup/complete`);
  }
}

export const setupService = new SetupService();