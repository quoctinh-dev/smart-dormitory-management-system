// 📄 File: src/api/authApi.js
import axiosClient from './axiosClient';

const AUTH_PREFIX = '/v1/auth';
const USER_PREFIX = '/v1/users';

const authApi = {
  /** * Đăng nhập hệ thống (Dùng chung cho Admin/Staff/Student)
   * @param {{usernameOrEmail: string, password: string}} data 
   */
  login(data) {
    return axiosClient.post(`${AUTH_PREFIX}/login`, data);
  },

  /** * Cấp mới Access Token bằng cách xoay vòng Refresh Token
   * @param {string} refreshToken 
   */
  refreshToken(refreshToken) {
    return axiosClient.post(`${AUTH_PREFIX}/refresh-token`, { refreshToken });
  },

  /** * Đăng xuất người dùng hiện tại và thu hồi token 
   */
  logout() {
    return axiosClient.post(`${AUTH_PREFIX}/logout`);
  },

  /** * Đổi mật khẩu cho người dùng đang đăng nhập
   * @param {{oldPassword: string, newPassword: string}} data 
   */
  changePassword(data) {
    return axiosClient.post(`${AUTH_PREFIX}/change-password`, data);
  },

  /** * Yêu cầu khôi phục mật khẩu qua Email khi quên mật khẩu
   * @param {{email: string}} data 
   */
  forgotPassword(data) {
    return axiosClient.post(`${AUTH_PREFIX}/forgot-password`, data);
  },

  /** * Đặt lại mật khẩu mới thông qua Token bảo mật được gửi về Email
   * @param {{token: string, newPassword: string}} data 
   */
  resetPassword(data) {
    return axiosClient.post(`${AUTH_PREFIX}/reset-password`, data);
  },

  /** * Kích hoạt tài khoản cư dân sinh viên lần đầu tiên vào App
   * @param {{email: string, tempPassword: string, newPassword: string}} data 
   */
  activate(data) {
    return axiosClient.post(`${AUTH_PREFIX}/activate`, {
      email: data.email,
      tempPassword: data.tempPassword,
      newPassword: data.newPassword,
    });
  },

  /** * Trích xuất hồ sơ cá nhân của người dùng đang đăng nhập hiện hành 
   */
  getMe() {
    return axiosClient.get(`${USER_PREFIX}/me`);
  },
};

export default authApi;