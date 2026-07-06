import axiosClient from './axiosClient';

const ACCESS_URL = '/v1/access';

export const smartAccessApi = {
  // Get all access history (paginated)
  getAccessHistory(params: { page: number; size: number }) {
    return axiosClient.get(`${ACCESS_URL}/history`, { params });
  },

  // Remote Unlock
  remoteUnlock(gateId: string, buildingId: string) {
    return axiosClient.post(`${ACCESS_URL}/gates/${gateId}/unlock`, null, {
      params: { buildingId },
    });
  },

  // Emergency Override (Lockdown or Unlock)
  emergencyOverride(actionType: string, reason: string, buildingId?: string) {
    return axiosClient.post(`${ACCESS_URL}/emergency`, null, {
      params: { actionType, reason, buildingId },
    });
  },
};
