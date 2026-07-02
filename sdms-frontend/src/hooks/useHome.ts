import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { studentRegistrationApi } from '@/api';

export default function useHome() {
  const navigate = useNavigate();
  const [searchCccd, setSearchCccd] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkResult, setCheckResult] = useState({ success: false, message: '' });

  const handleCheckEligibility = async () => {
    const cleanCccd = searchCccd.trim();

    if (!cleanCccd) return;

    // Regex kiểm tra định dạng CMND (9 số) hoặc CCCD (12 số) cơ bản
    const cccdRegex = /^[0-9]{9}$|^[0-9]{12}$/;
    if (!cccdRegex.test(cleanCccd)) {
      setCheckResult({
        success: false,
        message:
          'Mã định danh không hợp lệ. Vui lòng kiểm tra lại (CMND gồm 9 chữ số hoặc CCCD gồm 12 chữ số).',
      });
      setDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      // axiosClient đã tự động bóc vỏ (.data.data), res ở đây chính là CheckEligibilityResponse từ Backend
      const res = (await studentRegistrationApi.checkEligibility({ cccd: cleanCccd })) as any;

      if (res && res.eligible) {
        setCheckResult({
          success: true,
          message: res.message || 'Bạn đủ điều kiện tham gia đợt đăng ký này!',
        });
      } else {
        setCheckResult({
          success: false,
          message: res?.message || 'Bạn không thuộc danh sách đủ điều kiện của đợt đăng ký này.',
        });
      }
    } catch (error: any) {
      // Đọc thông báo lỗi nghiệp vụ bọc từ interceptor của axiosClient ném ra (dạng chuỗi text hoặc object lỗi)
      setCheckResult({
        success: false,
        message: error.message || error || 'Bạn không thuộc danh sách ưu tiên đợt này.',
      });
    } finally {
      setLoading(false);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleNavigateRegister = () => {
    setDialogOpen(false);
    navigate('/register');
  };

  return {
    searchCccd,
    setSearchCccd,
    loading,
    dialogOpen,
    checkResult,
    handleCheckEligibility,
    handleCloseDialog,
    handleNavigateRegister,
  };
}
