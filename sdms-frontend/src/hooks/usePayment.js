import { useState, useEffect } from 'react';
import paymentApi from '@/api/paymentApi';
import applicationApi from '@/api/applicationApi'; // Import applicationApi to get application details

export const usePayment = (applicationId) => {
  const [bill, setBill] = useState(null);
  const [application, setApplication] = useState(null);
  const [paymentInstructions, setPaymentInstructions] = useState(null); // New state for payment instructions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!applicationId) {
        setLoading(false);
        setError('Application ID is missing.');
        return;
      }
      try {
        const [appRes, billRes, instructionsRes] = await Promise.all([
          applicationApi.getById(applicationId), // Use applicationApi to get application details
          paymentApi.getBillByApplication(applicationId),
          paymentApi.getPaymentInstructions(), // Fetch payment instructions
        ]);

        if (isMounted) {
          setApplication(appRes.data || appRes);
          setBill(billRes.data || billRes);
          setPaymentInstructions(instructionsRes.data || instructionsRes);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err.response?.data?.message || 'Không tìm thấy thông tin hóa đơn hoặc hồ sơ cho hồ sơ này.');
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
    paymentInstructions, // Return payment instructions
    loading,
    error,
    paying,
    snackbar,
    handleMockPayment,
    closeSnackbar,
  };
};