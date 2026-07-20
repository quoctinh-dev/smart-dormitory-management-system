import { useState, useCallback } from 'react';

import { smartAccessApi } from '@/api';
import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';

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

export interface IOutsideStudent {
  studentId: string;
  studentName: string;
  studentCode: string;
  roomCode: string;
  buildingName: string;
  lastOutTime: string;
}

export const useSmartAccess = () => {
  const [history, setHistory] = useState<IAccessHistory[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Curfew Requests State
  const [curfewRequests, setCurfewRequests] = useState<ICurfewRequest[]>([]);
  const [totalCurfewRequests, setTotalCurfewRequests] = useState(0);

  // Outside Students State
  const [outsideStudents, setOutsideStudents] = useState<IOutsideStudent[]>([]);
  const [loadingOutside, setLoadingOutside] = useState(false);

  const fetchHistory = useCallback(
    async (
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
            endDate: filters?.endDate,
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
    },
    []
  );

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
      snackbar.error(
        `Thao tác khẩn cấp thất bại: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCurfewRequests = useCallback(async (page: number, size: number, status?: string) => {
    try {
      setLoading(true);
      const res = (await smartAccessApi.getCurfewRequests({ page, size, status })) as any;
      setCurfewRequests(res.content || []);
      setTotalCurfewRequests(res.totalElements || 0);
    } catch (error: any) {
      console.error('Failed to fetch curfew requests', error);
      snackbar.error('Lỗi tải danh sách yêu cầu vào trễ.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateCurfewRequest = useCallback(
    async (id: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) => {
      try {
        if (status === 'APPROVED') {
          await smartAccessApi.bulkApproveCurfewRequests([id], adminNote);
        } else {
          await smartAccessApi.bulkRejectCurfewRequests([id], adminNote);
        }
        snackbar.success(`Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} yêu cầu thành công`);
        fetchCurfewRequests(0, 10, 'PENDING');
      } catch (error: any) {
        snackbar.error(error.response?.data?.message || 'Lỗi khi cập nhật yêu cầu');
      }
    },
    [fetchCurfewRequests]
  );

  const handleBulkUpdateCurfewRequests = useCallback(
    async (ids: string[], status: 'APPROVED' | 'REJECTED', adminNote?: string) => {
      if (!ids.length) return;
      try {
        if (status === 'APPROVED') {
          await smartAccessApi.bulkApproveCurfewRequests(ids, adminNote);
        } else {
          await smartAccessApi.bulkRejectCurfewRequests(ids, adminNote);
        }
        snackbar.success(`Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} ${ids.length} yêu cầu thành công`);
        fetchCurfewRequests(0, 10, 'PENDING');
      } catch (error: any) {
        snackbar.error(error.response?.data?.message || 'Lỗi khi cập nhật hàng loạt');
      }
    },
    [fetchCurfewRequests]
  );

  const fetchOutsideStudents = useCallback(async () => {
    try {
      setLoadingOutside(true);
      const res = (await smartAccessApi.getOutsideStudents()) as any;
      setOutsideStudents(res || []);
    } catch (error: any) {
      console.error('Failed to fetch outside students', error);
      snackbar.error('Lỗi tải danh sách vắng mặt.');
    } finally {
      setLoadingOutside(false);
    }
  }, []);

  const [buildings, setBuildings] = useState<any[]>([]);

  // Fetch Buildings
  const fetchBuildings = useCallback(async () => {
    try {
      const res = await roomApi.getBuildings();
      setBuildings(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.error('Failed to load buildings', err);
    }
  }, []);

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
    handleUpdateCurfewRequest,
    handleBulkUpdateCurfewRequests,
    outsideStudents,
    loadingOutside,
    fetchOutsideStudents,
    buildings,
    fetchBuildings,
  };
};
