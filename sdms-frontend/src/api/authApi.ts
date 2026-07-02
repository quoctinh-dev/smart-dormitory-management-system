import axiosClient from './axiosClient';

const AUTH_PREFIX = '/v1/auth';
const USER_PREFIX = '/v1/users';

export interface LoginRequest {
  usernameOrEmail: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  accountId: string;
  username: string;
  email: string;
  campusId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  /**
   * Đăng nhập hệ thống (Dùng chung cho Admin/Staff/Student)
   */
  login(data: LoginRequest): Promise<AuthTokens> {
    return axiosClient.post(`${AUTH_PREFIX}/login`, data);
  },

  /**
   * Cấp mới Access Token bằng cách xoay vòng Refresh Token
   */
  refreshToken(refreshToken: string): Promise<AuthTokens> {
    return axiosClient.post(`${AUTH_PREFIX}/refresh-token`, { refreshToken });
  },

  /**
   * Đăng xuất người dùng hiện tại và thu hồi token
   */
  logout(): Promise<void> {
    return axiosClient.post(`${AUTH_PREFIX}/logout`);
  },

  /**
   * Đổi mật khẩu cho người dùng đang đăng nhập
   */
  changePassword(data: any): Promise<void> {
    return axiosClient.post(`${AUTH_PREFIX}/change-password`, data);
  },

  /**
   * Yêu cầu khôi phục mật khẩu qua Email khi quên mật khẩu
   */
  forgotPassword(data: any): Promise<void> {
    return axiosClient.post(`${AUTH_PREFIX}/forgot-password`, data);
  },

  /**
   * Đặt lại mật khẩu mới thông qua Token bảo mật được gửi về Email
   */
  resetPassword(data: any): Promise<void> {
    return axiosClient.post(`${AUTH_PREFIX}/reset-password`, data);
  },

  /**
   * Kích hoạt tài khoản cư dân sinh viên lần đầu tiên vào App
   */
  activate(data: any): Promise<AuthTokens> {
    return axiosClient.post(`${AUTH_PREFIX}/activate`, {
      email: data.email,
      tempPassword: data.tempPassword,
      newPassword: data.newPassword,
    });
  },

  /**
   * Trích xuất hồ sơ cá nhân của người dùng đang đăng nhập hiện hành
   */
  getMe(): Promise<UserProfile> {
    return axiosClient.get(`${USER_PREFIX}/me`);
  },
};

export default authApi;
