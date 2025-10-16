import axios from 'axios';
import { ChangeRequest, ChangeResponse, SupportedLocales } from '../types';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cashRegisterAPI = {
  // Calculate change for a single transaction
  calculateChange: async (request: ChangeRequest): Promise<ChangeResponse> => {
    const response = await api.post<ChangeResponse>('/calculate-change', request);
    return response.data;
  },


  // Get supported locales
  getSupportedLocales: async (): Promise<SupportedLocales> => {
    const response = await api.get<SupportedLocales>('/supported-locales');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get<{ status: string }>('/health');
    return response.data;
  },
};

export default api;
