// 📄 File: src/types/auth.ts

export interface LoginData {
  username?: string;
  email?: string;
  password?: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface ChangePasswordData {
  oldPassword?: string;
  newPassword?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword?: string;
}

export interface ActivateData {
  email: string;
  tempPassword?: string;
  newPassword?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  campusId: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}
