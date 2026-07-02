// 📄 File: src/hooks/public/useActivateAccount.js
import { useState, useCallback } from 'react';

import { authApi } from '@/api';
import { snackbar } from '@/utils/snackbar';

export const useActivateAccount = () => {
  const [formData, setFormData] = useState({
    email: '',
    tempPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();

      const { email, tempPassword, newPassword, confirmPassword } = formData;

      if (!email || !tempPassword || !newPassword || !confirmPassword) {
        snackbar.error('Vui lòng điền đầy đủ tất cả các trường thông tin.');
        return;
      }
      if (newPassword.length < 8) {
        snackbar.error('Mật khẩu mới phải có độ dài tối thiểu từ 8 ký tự trở lên.');
        return;
      }
      if (newPassword !== confirmPassword) {
        snackbar.error('Xác nhận mật khẩu mới không trùng khớp.');
        return;
      }

      setLoading(true);
      try {
        await authApi.activate({
          email: email.trim(),
          tempPassword: tempPassword.trim(),
          newPassword: newPassword,
        });

        setSuccess(true);
        snackbar.success('Kích hoạt thành công! Mật khẩu chính thức của bạn đã được thiết lập.');
      } catch (err: any) {
        console.error('Activation failed:', err);
        snackbar.error(
          err.response?.data?.message ||
            err.message ||
            'Kích hoạt thất bại. Vui lòng kiểm tra lại thông tin.'
        );
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    formData,
    showPassword,
    loading,
    success,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  };
};
