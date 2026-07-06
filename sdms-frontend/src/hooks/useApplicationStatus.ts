// 📄 File: src/hooks/public/useApplicationStatus.js
import { useState, useCallback } from 'react';

import applicationApi from '@/api/applicationApi';
import paymentApi from '@/api/paymentApi';
import { snackbar } from '@/utils/snackbar';

interface ApplicationStatus {
  applicationId: string;
  status: string;
  cccd: string;
  assignment?: any;
  bill?: any;
  documents?: any[];
  reviewNote?: string;
}

export const useApplicationStatus = () => {
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  const fetchStatus = useCallback(async (cccd: string) => {
    if (!cccd) {
      snackbar.error('Vui lòng nhập số CCCD/CMND để kiểm tra trạng thái hồ sơ.');
      return;
    }

    setApplication(null); // Reset state trước khi tìm kiếm mới
    setLoading(true);

    try {
      const appData: ApplicationStatus = (await applicationApi.getStatus({ cccd })) as any;

      if (appData) {
        try {
          const roomData = appData.assignment;
          appData.assignment = roomData;
        } catch (roomErr: any) {
          console.log(
            'Hồ sơ chưa được xếp phòng dự kiến:',
            roomErr.response?.data?.message || roomErr.message
          );
        }

        if (appData.status === 'WAITING_PAYMENT') {
          try {
            const billData = await paymentApi.getBillByApplication(appData.applicationId);
            appData.bill = billData;
          } catch (billErr: any) {
            console.warn('Chưa tìm thấy hóa đơn:', billErr);
          }
        }

        setApplication(appData);
        snackbar.success('Tải trạng thái hồ sơ thành công!');
      } else {
        snackbar.error('Không tìm thấy thông tin hồ sơ với số CCCD/CMND này.');
      }
    } catch (err: any) {
      snackbar.error(
        err.response?.status === 404
          ? 'Hồ sơ không tồn tại.'
          : 'Đã xảy ra lỗi hệ thống khi kiểm tra trạng thái hồ sơ.'
      );
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMockPayment = useCallback(async () => {
    if (!application?.applicationId) {
      snackbar.error('Không có thông tin hồ sơ để thực hiện thanh toán.');
      return;
    }

    setPaymentLoading(true);
    try {
      await paymentApi.mockPaymentSuccess(application.applicationId);
      snackbar.success('Thanh toán giả lập thành công! Trạng thái hồ sơ sẽ được cập nhật.');

      await fetchStatus(application.cccd);
    } catch (err: any) {
      console.error(err);
      snackbar.error(
        'Lỗi hệ thống khi thanh toán thử nghiệm: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setPaymentLoading(false);
    }
  }, [application, fetchStatus]);

  return {
    application,
    loading,
    paymentLoading,
    fetchStatus,
    handleMockPayment,
  };
};
