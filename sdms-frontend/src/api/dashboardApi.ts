import axiosClient from './axiosClient';

export interface DashboardStatsResponse {
  pendingApplications: number;
  waitingForPayment: number;
  pendingCheckIn: number;
  occupiedAssignments: number;
  totalRooms: number;
  totalBeds: number;
  totalBuildings: number;
  totalFloors: number;
}

const dashboardApi = {
  getStats(): Promise<DashboardStatsResponse> {
    return axiosClient.get('/v1/dashboard/stats');
  },
};

export default dashboardApi;
