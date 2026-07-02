import { useState, useEffect } from 'react';

import applicationApi from '@/api/applicationApi';
import paymentApi from '@/api/paymentApi';
import { snackbar } from '@/utils/snackbar';

export const usePayment = (applicationId: any) => {
  const [bill, setBill] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!applicationId) {
        setLoading(false);
        snackbar.error('Mã hồ sơ không được cung cấp.');
        return;
      }
      try {
        const [appRes, billRes, instructionsRes] = await Promise.all([
          applicationApi.getById(applicationId),
          paymentApi.getBillByApplication(applicationId),
          paymentApi.getPaymentInstructions(),
        ]);

        if (isMounted) {
          setApplication(appRes.data || appRes);
          setBill(billRes.data || billRes);
          setPaymentInstructions(instructionsRes.data || instructionsRes);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(err);
          snackbar.error(
            err.response?.data?.message ||
              'Không tìm thấy thông tin hóa đơn hoặc hồ sơ cho hồ sơ này.'
          );
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [applicationId]);

  const handleMockPayment = async (onSuccessCallback: any) => {
    setPaying(true);
    try {
      await paymentApi.mockPaymentSuccess(applicationId);

      snackbar.success(
        'Thanh toán thành công! Hệ thống đang tự động khởi tạo tài khoản định danh...'
      );

      if (onSuccessCallback) {
        setTimeout(onSuccessCallback, 2500);
      }
    } catch (err: any) {
      snackbar.error(`Lỗi xử lý giao dịch: ${err.response?.data?.message || err.message}`);
      setPaying(false);
    }
  };

  return {
    bill,
    application,
    paymentInstructions,
    loading,
    paying,
    handleMockPayment,
  };
};
