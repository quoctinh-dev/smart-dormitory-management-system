import axiosClient from './axiosClient';

export interface SystemConfig {
  configKey: string;
  configValue: string;
  description: string;
}

export const systemConfigApi = {
  getAllConfigs: async (): Promise<SystemConfig[]> => {
    const res = await axiosClient.get('/v1/admin/system-configs');
    return res as any; 
  },
  
  updateConfig: async (key: string, data: Partial<SystemConfig>) => {
    const res = await axiosClient.put(`/v1/admin/system-configs/${key}`, data);
    return res;
  }
};