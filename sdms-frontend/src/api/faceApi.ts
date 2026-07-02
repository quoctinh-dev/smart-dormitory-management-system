// @ts-nocheck
import axiosClient from './axiosClient';

const ADMIN_FACE_URL = '/v1/admin/faces';

const faceApi = {
  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================
  getPendingProfiles(params) {
    return axiosClient.get(`${ADMIN_FACE_URL}/pending`, { params });
  },

  approveFace(profileId, adminId) {
    return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/approve`, null, {
      headers: { 'X-Admin-Id': adminId },
    });
  },

  rejectFace(profileId, reason) {
    return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/reject`, {
      rejectionReason: reason,
    });
  },
};

export default faceApi;
