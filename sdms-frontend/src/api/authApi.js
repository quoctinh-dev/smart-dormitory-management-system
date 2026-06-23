import axiosClient from './axiosClient';

const AUTH_PREFIX = '/v1/auth';
const USER_PREFIX = '/v1/users';

const authApi = {
  /** @param {{usernameOrEmail: string, password: string}} data */
  login(data) {
    return axiosClient.post(`${AUTH_PREFIX}/login`, data);
  },

  /** @param {string} refreshToken */
  refreshToken(refreshToken) {
    return axiosClient.post(`${AUTH_PREFIX}/refresh-token`, { refreshToken });
  },

  logout() {
    return axiosClient.post(`${AUTH_PREFIX}/logout`);
  },

  /** @param {{oldPassword: string, newPassword: string}} data */
  changePassword(data) {
    return axiosClient.post(`${AUTH_PREFIX}/change-password`, data);
  },

  /** @param {{email: string}} data */
  forgotPassword(data) {
    return axiosClient.post(`${AUTH_PREFIX}/forgot-password`, data);
  },

  /** @param {{token: string, newPassword: string}} data */
  resetPassword(data) {
    return axiosClient.post(`${AUTH_PREFIX}/reset-password`, data);
  },

  /** * Kích hoạt tài khoản định danh sinh viên lần đầu
   * @param {{email: string, tempPassword: string, newPassword: string}} data 
   */
  activate(data) {
    return axiosClient.post(`${AUTH_PREFIX}/activate`, {
      email: data.email,
      tempPassword: data.tempPassword,
      newPassword: data.newPassword,
    });
  },

  /** Lấy thông tin user hiện tại */
  getMe() {
    return axiosClient.get(`${USER_PREFIX}/me`);
  },
};

export default authApi;