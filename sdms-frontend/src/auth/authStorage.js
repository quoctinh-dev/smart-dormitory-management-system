// Hằng số định danh cục bộ
const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

export const authStorage = {
  getAccessToken() {
    try {
      return localStorage.getItem(ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token from localStorage:', error);
      return null;
    }
  },

  getRefreshToken() {
    try {
      return localStorage.getItem(REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token from localStorage:', error);
      return null;
    }
  },

  setTokens({ accessToken, refreshToken }) {
    try {
      if (accessToken) localStorage.setItem(ACCESS_TOKEN, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Failed to set tokens to localStorage (Storage might be full or blocked):', error);
    }
  },

  clear() {
    try {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to clear tokens from localStorage:', error);
    }
  },

  hasSession() {
    try {
      return !!localStorage.getItem(ACCESS_TOKEN) && !!localStorage.getItem(REFRESH_TOKEN);
    } catch (error) {
      return false;
    }
  },
};