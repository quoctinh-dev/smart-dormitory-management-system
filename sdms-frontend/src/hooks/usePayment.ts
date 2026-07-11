import { useState, useEffect } from 'react';

import applicationApi from '@/api/applicationApi';
import paymentApi from '@/api/paymentApi';
import { snackbar } from '@/utils/snackbar';

import type { BillResponse, PaymentInstruction } from '@/types/payment';
import type { ApplicationResponse } from '@/types/application';

export const usePayment = (applicationId: string) => {
  const [bill, setBill] = useState<BillResponse | null>(null);
  const [application, setApplication] = useState<ApplicationResponse | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstruction | null>(null);
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
          setApplication((appRes as any).data || appRes);
          setBill((billRes as any).data || billRes);
          setPaymentInstructions((instructionsRes as any).data || instructionsRes);
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

  const handleMockPayment = async (onSuccessCallback: () => void) => {
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
