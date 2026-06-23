import axiosClient from './axiosClient';

const CHECKIN_PREFIX = '/v1/admin/check-in';

const checkInApi = {
  searchStudent(cccd) {
    return axiosClient.get(`${CHECKIN_PREFIX}/search?cccd=${cccd}`);
  },

  confirmCheckIn(assignmentId) {
    return axiosClient.post(`${CHECKIN_PREFIX}/${assignmentId}`);
  },
};

export default checkInApi;