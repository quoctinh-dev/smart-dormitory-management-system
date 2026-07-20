import { useState, useEffect } from 'react';

import applicationApi from '@/api/application-api';
import paymentApi from '@/api/payment-api';
import { snackbar } from '@/helpers/snackbar';
import type { ApplicationResponse } from '@/types/application';
import type { BillResponse, PaymentInstruction } from '@/types/payment';

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

  const handleOnlinePayment = async (
    paymentMethod: string = 'BANK_TRANSFER',
    onSuccessCallback?: () => void
  ) => {
    setPaying(true);
    try {
      const response = await paymentApi.processOnlinePayment({
        billId: bill!.billId,
        amount: bill!.remainingAmount > 0 ? bill!.remainingAmount : bill!.amount,
        paymentMethod,
        returnUrl: window.location.origin + '/status',
      });

      if (response.paymentUrl) {
        return response.paymentUrl;
      }

      onSuccessCallback?.();
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
    handleOnlinePayment,
  };
};
