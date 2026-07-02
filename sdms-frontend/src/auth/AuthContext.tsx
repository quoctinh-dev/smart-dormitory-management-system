import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';

import { authApi } from '@/api';
import { authStorage } from '@/auth/authStorage';
import CustomSkeleton from '@/components/common/CustomSkeleton';

// Định nghĩa kiểu dữ liệu cho thông tin admin
interface Admin {
  id?: string;
  accountId?: string;
  username: string;
  email?: string;
  campusId?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa kiểu dữ liệu cho dữ liệu trả về khi đăng nhập
interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: Admin;
}

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (authData: AuthData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getAccessToken();

      if (token) {
        try {
          const userData = (await authApi.getMe()) as any;
          setAdmin(userData);
        } catch (error) {
          console.error('Auth init failed:', error);
          authStorage.clear();
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    if (!isInitialized.current) {
      isInitialized.current = true;
      initAuth();
    }
  }, []);

  const login = (authData: AuthData) => {
    authStorage.setTokens({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
    });
    setAdmin(authData.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API failed, forcing local logout:', error);
    } finally {
      authStorage.clear();
      setAdmin(null);
    }
  };

  if (loading) {
    return <CustomSkeleton type="dashboard" count={1} />;
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
