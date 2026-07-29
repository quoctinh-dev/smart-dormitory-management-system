import axiosClient from './axios-client';
import { DashboardStatsResponse, ExpiringAssignmentDto } from '../types/dashboard';

const dashboardApi = {
  getStats(): Promise<DashboardStatsResponse> {
    return axiosClient.get('/v1/dashboard/stats');
  },
  getExpiringAssignments(days: number = 7): Promise<ExpiringAssignmentDto[]> {
    return axiosClient.get('/v1/dashboard/expiring-assignments', { params: { days } });
  },
  clearCache(): Promise<string> {
    return axiosClient.get('/v1/dashboard/clear-cache');
  }
};

export default dashboardApi;
