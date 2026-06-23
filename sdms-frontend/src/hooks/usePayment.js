import { useState, useEffect } from 'react';
import paymentApi from '@/api/paymentApi';

export const usePayment = (applicationId) => {
  const [bill, setBill] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!applicationId) return;
      try {
        const [appRes, billRes] = await Promise.all([
          paymentApi.getApplicationDetail(applicationId),
          paymentApi.getBillByApplication(applicationId),
        ]);

        if (isMounted) {
          setApplication(appRes.data || appRes);
          setBill(billRes.data || billRes);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err.response?.data?.message || 'Không tìm thấy thông tin hóa đơn cho hồ sơ này.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [applicationId]);

  const handleMockPayment = async (onSuccessCallback) => {
    setPaying(true);
    try {
      await paymentApi.mockPaymentSuccess(applicationId);
      
      setSnackbar({
        open: true,
        message: 'Thanh toán thành công! Hệ thống đang tự động khởi tạo tài khoản định danh...',
        severity: 'success',
      });

      if (onSuccessCallback) {
        setTimeout(onSuccessCallback, 2500);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Lỗi xử lý giao dịch: ${err.response?.data?.message || err.message}`,
        severity: 'error',
      });
      setPaying(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return {
    bill,
    application,
    loading,
    error,
    paying,
    snackbar,
    handleMockPayment,
    closeSnackbar,
  };
};