import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';

import { authApi } from '@/api';
import CustomSkeleton from '@/components/common/CustomSkeleton';
import { authStorage } from '@/helpers/auth-storage';
import { UserProfile } from '@/types/auth';

interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (authData: AuthData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getAccessToken();

      if (token) {
        try {
          const userData = (await authApi.getMe()) as unknown as UserProfile;
          setUser(userData);
        } catch (error) {
          console.error('Auth init failed:', error);
          authStorage.clear();
          setUser(null);
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
    setUser(authData.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API failed, forcing local logout:', error);
    } finally {
      authStorage.clear();
      setUser(null);
    }
  };

  if (loading) {
    return <CustomSkeleton type="dashboard" count={1} />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
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
