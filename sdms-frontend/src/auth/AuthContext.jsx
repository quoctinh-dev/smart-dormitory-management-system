import { createContext, useContext, useEffect, useState } from 'react';

import { authApi } from '@/api';
import { authStorage } from '@/auth/authStorage'; 
import CustomSkeleton from '@/components/common/CustomSkeleton';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getAccessToken();

      if (token) {
        try {
          const userData = await authApi.getMe();
          setAdmin(userData);
        } catch (error) {
          console.error('Auth init failed:', error);
          authStorage.clear();
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (authData) => {
    // authData: { accessToken, refreshToken, user }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};