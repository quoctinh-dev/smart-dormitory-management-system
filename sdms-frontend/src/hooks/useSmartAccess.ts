import { useState, useCallback } from 'react';

import { smartAccessApi } from '@/api';
import { snackbar } from '@/utils/snackbar';

export interface IAccessHistory {
  id: string;
  studentId: string;
  gateId: string;
  buildingId: string;
  eventTimestamp: string;
  decision: 'GRANTED' | 'DENIED';
  denialReason: string | null;
  method: string;
  snapshotUrl?: string;
}

export interface ICurfewRequest {
  requestId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  reason: string;
  expectedArrivalTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  adminNote?: string;
}

export const useSmartAccess = () => {
  const [history, setHistory] = useState<IAccessHistory[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Curfew Requests State
  const [curfewRequests, setCurfewRequests] = useState<ICurfewRequest[]>([]);
  const [totalCurfewRequests, setTotalCurfewRequests] = useState(0);

  const fetchHistory = useCallback(async (
    page: number, 
    size: number, 
    searchStudentId?: string,
    filters?: { gateId?: string; decision?: string; startDate?: string; endDate?: string }
  ) => {
    try {
      setLoading(true);
      let res;
      if (searchStudentId && searchStudentId.trim() !== '') {
        res = (await smartAccessApi.getAccessHistoryByStudent(searchStudentId.trim(), {
          page,
          size,
        })) as any;
      } else {
        res = (await smartAccessApi.getAccessHistory({ 
          page, 
          size, 
          gateId: filters?.gateId,
          decision: filters?.decision,
          startDate: filters?.startDate,
          endDate: filters?.endDate
        })) as any;
      }
      setHistory(res.content || []);
      setTotalElements(res.totalElements || 0);
    } catch (error: any) {
      console.error('Failed to fetch access history', error);
      snackbar.error('Lỗi tải lịch sử ra vào.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoteUnlock = async (gateId: string, buildingId: string) => {
    try {
      await smartAccessApi.remoteUnlock(gateId, buildingId);
      snackbar.success('Đã gửi lệnh mở cổng từ xa thành công!');
    } catch (error: any) {
      snackbar.error(`Mở cổng thất bại: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEmergencyOverride = async (
    actionType: string,
    reason: string,
    buildingId?: string
  ) => {
    try {
      setLoading(true);
      await smartAccessApi.emergencyOverride(actionType, reason, buildingId);
      snackbar.warning('Đã kích hoạt Lệnh Khẩn Cấp thành công!');
      fetchHistory(0, 10, ''); // Refresh history
    } catch (error: any) {
      snackbar.error(`Thao tác khẩn cấp thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };



  const fetchCurfewRequests = useCallback(async (page: number, size: number, status?: string) => {
    try {
      setLoading(true);
      const res = (await smartAccessApi.getCurfewRequests({ page, size, status })) as any;
      setCurfewRequests(res.data.content || []);
      setTotalCurfewRequests(res.data.totalElements || 0);
    } catch (error: any) {
      console.error('Failed to fetch curfew requests', error);
      snackbar.error('Lỗi tải danh sách yêu cầu vào trễ.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCurfewRequestStatus = async (id: string, status: string, adminNote?: string) => {
    try {
      setLoading(true);
      await smartAccessApi.updateCurfewRequest(id, { status, adminNote });
      snackbar.success('Cập nhật trạng thái yêu cầu thành công!');
      fetchCurfewRequests(0, 10); // Refresh list
    } catch (error: any) {
      snackbar.error(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    history,
    totalElements,
    loading,
    fetchHistory,
    handleRemoteUnlock,
    handleEmergencyOverride,
    curfewRequests,
    totalCurfewRequests,
    fetchCurfewRequests,
    updateCurfewRequestStatus,
  };
};
