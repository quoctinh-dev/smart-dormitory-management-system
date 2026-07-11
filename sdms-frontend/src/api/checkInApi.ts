import axiosClient from './axiosClient';

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

const checkInApi = {
  getList(params?: any): Promise<any> {
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
