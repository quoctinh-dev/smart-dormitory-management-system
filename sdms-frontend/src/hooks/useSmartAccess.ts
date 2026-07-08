import { useState, useCallback } from 'react';

import { smartAccessApi } from '@/api';

export interface IAccessHistory {
  historyId: string;
  studentId: string;
  gateId: string;
  buildingId: string;
  eventTimestamp: string;
  decision: 'GRANTED' | 'DENIED';
  denialReason: string | null;
  method: string;
}

export const useSmartAccess = () => {
  const [history, setHistory] = useState<IAccessHistory[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const fetchHistory = useCallback(async (page: number, size: number, searchStudentId?: string) => {
    try {
      setLoading(true);
      let res;
      if (searchStudentId && searchStudentId.trim() !== '') {
        res = (await smartAccessApi.getAccessHistoryByStudent(searchStudentId.trim(), { page, size })) as any;
      } else {
        res = (await smartAccessApi.getAccessHistory({ page, size })) as any;
      }
      setHistory(res.content || []);
      setTotalElements(res.totalElements || 0);
    } catch (error: any) {
      console.error('Failed to fetch access history', error);
      setSnackbar({
        open: true,
        message: 'Lỗi tải lịch sử ra vào.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoteUnlock = async (gateId: string, buildingId: string) => {
    try {
      await smartAccessApi.remoteUnlock(gateId, buildingId);
      setSnackbar({
        open: true,
        message: 'Đã gửi lệnh mở cổng từ xa thành công!',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Mở cổng thất bại: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    }
  };

  const handleEmergencyOverride = async (actionType: string, reason: string, buildingId?: string) => {
    try {
      setLoading(true);
      await smartAccessApi.emergencyOverride(actionType, reason, buildingId);
      setSnackbar({
        open: true,
        message: 'Đã kích hoạt Lệnh Khẩn Cấp thành công!',
        severity: 'warning',
      });
      fetchHistory(0, 10, ''); // Refresh history
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Thao tác khẩn cấp thất bại: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return {
    history,
    totalElements,
    loading,
    snackbar,
    fetchHistory,
    handleRemoteUnlock,
    handleEmergencyOverride,
    closeSnackbar,
  };
};
