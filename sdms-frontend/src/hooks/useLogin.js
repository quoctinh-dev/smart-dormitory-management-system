import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuth, authStorage } from '@/auth';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      // GIỮ NGUYÊN HOÀN TOÀN LUỒNG CŨ - CHỈ BỔ SUNG ÉP KIỂU STRING ĐỂ CHẶN LỖI PRIMITIVE CHÍ MẠNG
      const serverMessage = err.response?.data?.message || err.response?.data;
      
      // Chốt chặn bảo vệ: Nếu serverMessage là chuỗi thì lấy, nếu là Object hệ thống thì ép sang chuỗi thô, tránh làm sập App
      const finalErrorMessage = typeof serverMessage === 'string' 
        ? serverMessage 
        : (serverMessage && typeof serverMessage === 'object' 
            ? (serverMessage.message || serverMessage.error || JSON.stringify(serverMessage)) 
            : 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
      
      setError(finalErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, showPassword, loading, error,
    handleChange, toggleShowPassword, handleSubmit
  };
};