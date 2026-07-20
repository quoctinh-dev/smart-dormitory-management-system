import { useState, useEffect, useCallback } from 'react';

import { changeRoomApi } from '@/api/change-room-api';
import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import {
  ChangeRoomResponseDto,
  AdminProcessChangeRoomDto,
} from '@/types/change-room';
import { BedResponse } from '@/types/room';

export const useChangeRoomManagement = () => {
  const [tabValue, setTabValue] = useState(0);

  const [requests, setRequests] = useState<ChangeRoomResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRoomResponseDto | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processData, setProcessData] = useState<AdminProcessChangeRoomDto>({
    isApproved: false,
    adminNote: '',
    newBedId: '',
  });
  const [availableBeds, setAvailableBeds] = useState<BedResponse[]>([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await changeRoomApi.getAllRequests();
      if (res && res.content) {
        setRequests(res.content);
      } else if (Array.isArray(res)) {
        setRequests(res as any);
      }
    } catch (error: any) {
      snackbar.error(error.response?.data?.message || 'Lỗi khi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      fetchRequests();
    }
  }, [tabValue, fetchRequests]);

  const handleProcessOpen = async (request: ChangeRoomResponseDto, isApproved: boolean) => {
    setSelectedRequest(request);
    setProcessData({ isApproved, adminNote: '', newBedId: '' });
    setProcessDialogOpen(true);
    setAvailableBeds([]);

    if (isApproved && request.targetRoomId) {
      setLoadingBeds(true);
      try {
        const beds = await roomApi.getBedsByRoom(request.targetRoomId);
        setAvailableBeds(beds.filter((b) => b.status === 'AVAILABLE'));
      } catch (err) {
        snackbar.error('Lỗi khi tải danh sách giường của phòng đích');
      } finally {
        setLoadingBeds(false);
      }
    }
  };

  const handleProcessSubmit = async () => {
    if (!selectedRequest) return;
    if (processData.isApproved && !processData.newBedId) {
      snackbar.warning('Vui lòng nhập ID giường mới để chuyển sinh viên đến');
      return;
    }

    try {
      await changeRoomApi.processRequest(selectedRequest.id, processData);
      snackbar.success('Xử lý yêu cầu thành công');
      setProcessDialogOpen(false);
      fetchRequests();
    } catch (error: any) {
      snackbar.error(error.response?.data?.message || 'Xử lý thất bại');
    }
  };

  return {
    tabValue,
    setTabValue,
    requests,
    loading,
    selectedRequest,
    processDialogOpen,
    setProcessDialogOpen,
    processData,
    setProcessData,
    availableBeds,
    loadingBeds,
    handleProcessOpen,
    handleProcessSubmit,
  };
};
