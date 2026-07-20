// 📄 File: src/hooks/public/useActivateAccount.ts
import { useState, useCallback } from 'react';

import { authApi } from '@/api';
import { snackbar } from '@/helpers/snackbar';
import { validatePassword } from '@/helpers/validate';
import { getErrorMessage } from '@/types/api';

export const useActivateAccount = () => {
  const [formData, setFormData] = useState({
    studentCode: '',
    tempPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const { studentCode, tempPassword, newPassword, confirmPassword } = formData;

      if (!studentCode || !tempPassword || !newPassword || !confirmPassword) {
        snackbar.error('Vui lòng điền đầy đủ tất cả các trường thông tin.');
        return;
      }
      if (!validatePassword(newPassword)) {
        snackbar.error(
          'Mật khẩu phải từ 8-50 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.'
        );
        return;
      }
      if (newPassword !== confirmPassword) {
        snackbar.error('Xác nhận mật khẩu mới không trùng khớp.');
        return;
      }

      setLoading(true);
      try {
        await authApi.activate({
          studentCode: studentCode.trim(),
          tempPassword: tempPassword.trim(),
          newPassword: newPassword,
        });

        setSuccess(true);
        snackbar.success('Kích hoạt thành công! Mật khẩu chính thức của bạn đã được thiết lập.');
      } catch (err: unknown) {
        console.error('Activation failed:', err);
        snackbar.error(
          getErrorMessage(err, 'Kích hoạt thất bại. Vui lòng kiểm tra lại thông tin.')
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
