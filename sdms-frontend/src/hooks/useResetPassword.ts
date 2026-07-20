import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import authApi from '@/api/auth-api';
import { validatePassword } from '@/helpers/validate';

export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Token khôi phục không hợp lệ hoặc bị thiếu.');
      return;
    }
    if (!validatePassword(password)) {
      setError(
        'Mật khẩu phải từ 8-50 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.'
      );
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Token đã hết hạn hoặc không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    loading,
    error,
    success,
    toggleShowPassword,
    handleSubmit,
  };
};
