import axiosClient from './axiosClient';
import type { PageResponse } from './notificationApi';

const CHECKIN_PREFIX = '/v1/admin/check-in';

export interface CheckInSearchResponse {
  assignmentId: string;
  studentName: string;
  studentCode: string;
  cccd: string;
  gender: string;
  portraitUrl: string;
  buildingName: string;
  floorName: string;
  roomName: string;
  bedName: string;
}

export interface HousingAssignmentDto {
  assignmentId: string;
  status: string; // 'PENDING_CHECKIN' | 'OCCUPIED'
  checkInAt?: string;
  student: {
    studentCode: string;
    fullName: string;
    cccd?: string;
  };
  buildingName: string;
  roomCode: string;
  bedCode: string;
}

export interface HousingAssignmentListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

const checkInApi = {
  getList(params?: HousingAssignmentListParams): Promise<PageResponse<HousingAssignmentDto>> {
    return axiosClient.get(`/v1/admin/housing-assignments`, { params });
  },

  searchStudent(cccd: string): Promise<CheckInSearchResponse> {
    return axiosClient.get(`${CHECKIN_PREFIX}/search?cccd=${cccd}`);
  },

  confirmCheckIn(assignmentId: string): Promise<{ message: string }> {
    return axiosClient.post(`${CHECKIN_PREFIX}/${assignmentId}`);
  },
};

export default checkInApi;
