import axiosClient from './axios-client';
import type { PageResponse } from './notification-api';

const ADMIN_FACE_URL = '/v1/admin/faces';

import { FaceProfileResponse, FaceActionParams } from '../types/face';

const faceApi = {
  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================
  getPendingProfiles(params: FaceActionParams): Promise<PageResponse<FaceProfileResponse>> {
    return axiosClient.get(`${ADMIN_FACE_URL}/pending`, { params });
  },

  approveFace(profileId: string, adminId: string): Promise<void> {
    return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/approve`, null, {
      headers: { 'X-Admin-Id': adminId },
    });
  },

  rejectFace(profileId: string, reason: string): Promise<void> {
    return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/reject`, {
      rejectionReason: reason,
    });
  },
};

export default faceApi;
