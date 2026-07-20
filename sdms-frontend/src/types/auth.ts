// 📄 File: src/types/auth.ts

export interface LoginData {
  usernameOrEmail: string;
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
  studentCode: string;
  tempPassword?: string;
  newPassword?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

export interface UserProfile {
  accountId: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN' | string;
  status: string;
}
