import axiosClient from './axios-client';
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
}

import {
  AdminProcessChangeRoomDto,
  ChangeRoomRequestStatus,
  ChangeRoomResponseDto,
  MaintenanceRelocationDto,
} from '../types/change-room';

export const changeRoomApi = {
  // ADMIN: Lấy danh sách yêu cầu
  getAllRequests: (
    status?: ChangeRoomRequestStatus,
    page: number = 0,
    size: number = 10
  ): Promise<{ content: ChangeRoomResponseDto[]; totalElements: number }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());

    return axiosClient.get(`/v1/admin/change-room/requests?${params.toString()}`);
  },

  // ADMIN: Duyệt / Từ chối yêu cầu
  processRequest: (id: number, data: AdminProcessChangeRoomDto): Promise<ChangeRoomResponseDto> => {
    return axiosClient.post(`/v1/admin/change-room/requests/${id}/process`, data);
  },

  // ADMIN: Di dời bảo trì
  relocateForMaintenance: (data: MaintenanceRelocationDto): Promise<void> => {
    return axiosClient.post(`/v1/admin/change-room/maintenance/relocate`, data);
  },
};
