import axiosClient from './axios-client';

const ACCESS_URL = '/v1/access';

export const smartAccessApi = {
  // Get all access history (paginated)
  getAccessHistory(params: {
    page: number;
    size: number;
    studentId?: string;
    gateId?: string;
    decision?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return axiosClient.get(`${ACCESS_URL}/history`, { params });
  },

  // Get access history for a specific student (Admin targeted view)
  getAccessHistoryByStudent(studentId: string, params: { page: number; size: number }) {
    return axiosClient.get(`${ACCESS_URL}/history/student/${studentId}`, { params });
  },

  // Bulk Curfew Request Actions
  bulkApproveCurfewRequests(requestIds: string[], adminNote?: string) {
    return axiosClient.post('/v1/curfew-requests/bulk/approve', { requestIds, adminNote });
  },

  bulkRejectCurfewRequests(requestIds: string[], adminNote?: string) {
    return axiosClient.post('/v1/curfew-requests/bulk/reject', { requestIds, adminNote });
  },

  // Remote Unlock
  remoteUnlock(gateId: string, buildingId: string, studentId?: string) {
    return axiosClient.post(`${ACCESS_URL}/gates/${gateId}/unlock`, null, {
      params: { buildingId, studentId },
    });
  },

  // Emergency Override (Lockdown or Unlock)
  emergencyOverride(actionType: string, reason: string, buildingId?: string) {
    return axiosClient.post(`${ACCESS_URL}/emergency`, null, {
      params: { actionType, reason, buildingId },
    });
  },

  // --- Curfew Requests ---
  getCurfewRequests(params: { page: number; size: number; status?: string }) {
    return axiosClient.get(`/v1/curfew-requests`, { params });
  },

  updateCurfewRequest(id: string, data: { status: string; adminNote?: string }) {
    return axiosClient.patch(`/v1/curfew-requests/${id}`, data);
  },

  // Get students currently outside
  getOutsideStudents() {
    return axiosClient.get(`${ACCESS_URL}/history/outside`);
  },

  // Manual sync: reset a student's IN/OUT status to fix tailgating issues
  syncStudentState(studentId: string, direction: 'IN' | 'OUT', reason?: string) {
    return axiosClient.post(`${ACCESS_URL}/history/sync-state`, { studentId, direction, reason });
  },
};
