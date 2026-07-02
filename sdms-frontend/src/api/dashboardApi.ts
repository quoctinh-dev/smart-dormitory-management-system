import axiosClient from './axiosClient';

const dashboardApi = {
  getStats() {
    return axiosClient.get('/v1/dashboard/stats');
  },
};

export default dashboardApi;
