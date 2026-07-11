import axiosClient from './axiosClient';
import type { PageResponse } from './notificationApi';

const ADMIN_FACE_URL = '/v1/admin/faces';

export interface FaceProfileResponse {
  profileId: string;
  studentId: string;
  fullName: string;
  imageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

const faceApi = {
  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================
  getPendingProfiles(params: any): Promise<PageResponse<FaceProfileResponse>> {
    return axiosClient.get(`${ADMIN_FACE_URL}/pending`, { params });
  },

  approveFace(profileId: string, adminId: string): Promise<any> {
    return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/approve`, null, {
      headers: { 'X-Admin-Id': adminId },
    });
  },

  rejectFace(profileId: string, reason: string): Promise<any> {
    return axiosClient.post(`${ADMIN_FACE_URL}/${profileId}/reject`, {
      rejectionReason: reason,
    });
  },
};

export default faceApi;
