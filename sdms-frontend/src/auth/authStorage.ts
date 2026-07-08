// Hằng số định danh cục bộ
const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const authStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token from localStorage:', error);
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token from localStorage:', error);
      return null;
    }
  },

  setTokens({ accessToken, refreshToken }: Partial<Tokens>): void {
    try {
      if (accessToken) localStorage.setItem(ACCESS_TOKEN, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error(
        'Failed to set tokens to localStorage (Storage might be full or blocked):',
        error
      );
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to clear tokens from localStorage:', error);
    }
  },

  hasSession(): boolean {
    try {
      return !!localStorage.getItem(ACCESS_TOKEN) && !!localStorage.getItem(REFRESH_TOKEN);
    } catch {
      return false;
    }
  },
};
