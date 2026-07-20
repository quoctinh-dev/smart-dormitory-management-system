import axiosClient from './axios-client';
import { DashboardStatsResponse } from '../types/dashboard';

const dashboardApi = {
  getStats(): Promise<DashboardStatsResponse> {
    return axiosClient.get('/v1/dashboard/stats');
  },
};

export default dashboardApi;
