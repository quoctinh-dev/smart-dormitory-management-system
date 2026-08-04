import axiosClient from './axios-client';
import type { PageResponse } from './notification-api';
import type { 
    MaintenanceResponse, 
    UpdateMaintenanceStatusRequest 
} from '../types/maintenance';

export const adminMaintenanceApi = {
    getAllRequests(params?: { page?: number; size?: number; status?: string; roomId?: string }): Promise<PageResponse<MaintenanceResponse>> {
        return axiosClient.get('/v1/admin/maintenance', { params });
    },
    updateStatus(id: string, data: UpdateMaintenanceStatusRequest): Promise<MaintenanceResponse> {
        return axiosClient.put(`/v1/admin/maintenance/${id}/status`, data);
    }
};
