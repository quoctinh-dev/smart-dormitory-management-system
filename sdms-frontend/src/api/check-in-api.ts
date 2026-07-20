import axiosClient from './axios-client';
import type { PageResponse } from './notification-api';

const CHECKIN_PREFIX = '/v1/admin/check-in';

import {
  CheckInSearchResponse,
  HousingAssignmentDto,
  HousingAssignmentListParams,
} from '../types/check-in';

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
