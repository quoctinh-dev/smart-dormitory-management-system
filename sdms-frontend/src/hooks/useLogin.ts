import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '@/api';
import { useAuth, authStorage } from '@/auth';
import { getAuthErrorMessage } from '@/constants';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usernameOrEmail.trim() || !formData.password) {
      setError('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({
        usernameOrEmail: formData.usernameOrEmail.trim(),
        password: formData.password,
      });

      authStorage.setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });

      const userData = await authApi.getMe();

      login({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: userData,
      });

      navigate('/admin', { replace: true });
    } catch (err: any) {
      const errorCode = err?.errorCode;
      const backendMessage = err?.message;

      // Ưu tiên hiển thị thông báo chi tiết từ Backend (VD: Lỗi khóa 15 phút do Brute-force)
      if (errorCode === 'ACCOUNT_LOCKED' && backendMessage) {
        setError(backendMessage);
      } else {
        setError(getAuthErrorMessage(errorCode));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    loading,
    error,
    handleChange,
    toggleShowPassword,
    handleSubmit,
  };
};
