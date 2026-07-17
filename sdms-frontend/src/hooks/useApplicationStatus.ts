import { useState, useCallback } from 'react';

import applicationApi from '@/api/applicationApi';
import paymentApi from '@/api/paymentApi';
import { getErrorMessage, isNotFoundError } from '@/types/api';
import type { AssignmentInfo, DocumentResponse } from '@/types/application';
import type { BillResponse } from '@/types/payment';
import { snackbar } from '@/utils/snackbar';

interface ApplicationStatusState {
  applicationId: string;
  status: string;
  studentCode: string;
  assignment?: AssignmentInfo;
  bill?: BillResponse;
  documents?: DocumentResponse[];
  reviewNote?: string;
  [key: string]: unknown;
}

export const useApplicationStatus = () => {
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [application, setApplication] = useState<ApplicationStatusState | null>(null);

  const fetchStatus = useCallback(async (studentCode: string) => {
    if (!studentCode) {
      snackbar.error('Vui lòng nhập Mã số sinh viên để kiểm tra trạng thái hồ sơ.');
      return;
    }

    setApplication(null); // Reset state trước khi tìm kiếm mới
    setLoading(true);

    try {
      const appData = await applicationApi.getStatus({ studentCode });
      const data = appData as unknown as ApplicationStatusState;

      if (data) {
        if (data.status === 'WAITING_PAYMENT') {
          try {
            const billData = await paymentApi.getBillByApplication(data.applicationId);
            data.bill = billData;
          } catch (billErr: unknown) {
            console.warn('Chưa tìm thấy hóa đơn:', billErr);
          }
        }

        setApplication(data);
        snackbar.success('Tải trạng thái hồ sơ thành công!');
      } else {
        snackbar.error('Không tìm thấy thông tin hồ sơ với Mã số sinh viên này.');
      }
    } catch (err: unknown) {
      snackbar.error(
        isNotFoundError(err)
          ? 'Hồ sơ không tồn tại.'
          : 'Đã xảy ra lỗi hệ thống khi kiểm tra trạng thái hồ sơ.'
      );
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOnlinePayment = useCallback(
    async (paymentMethod: string = 'BANK_TRANSFER') => {
      if (!application?.applicationId || !application.bill) {
        snackbar.error('Không có thông tin hồ sơ hoặc hóa đơn để thực hiện thanh toán.');
        return;
      }

      setPaymentLoading(true);
      try {
        const response = await paymentApi.processOnlinePayment({
          billId: application.bill.billId,
          amount:
            application.bill.remainingAmount > 0
              ? application.bill.remainingAmount
              : application.bill.amount,
          paymentMethod,
          returnUrl: window.location.origin + '/status',
        });

        if (response.paymentUrl) {
          // Trả về url thay vì redirect đi
          return response.paymentUrl;
        } else {
          snackbar.success('Thanh toán thành công!');
          fetchStatus(application.studentCode);
        }
      } catch (err: any) {
        snackbar.error(err?.response?.data?.message || 'Đã xảy ra lỗi khi khởi tạo thanh toán.');
      } finally {
        setPaymentLoading(false);
      }
    },
    [application, fetchStatus]
  );

  return {
    application,
    loading,
    paymentLoading,
    fetchStatus,
    handleOnlinePayment,
  };
};
