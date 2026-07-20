import { useState, useEffect, useCallback } from 'react';

import checkInApi from '@/api/check-in-api';
import { snackbar } from '@/helpers/snackbar';
import type { HousingAssignmentDto } from '@/types/check-in';

export const useCheckInManagement = () => {
  const [data, setData] = useState<HousingAssignmentDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await checkInApi.getList({
        page,
        size: rowsPerPage,
        search: searchQuery,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      });
      setData(res.content ?? []);
      setTotalElements(res.totalElements ?? res.content?.length ?? 0);
    } catch (err: unknown) {
      console.error(err);
      snackbar.error('Lỗi khi tải danh sách kiểm soát Check-in');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, filterStatus]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleManualCheckIn = async (assignmentId: string) => {
    try {
      await checkInApi.confirmCheckIn(assignmentId);
      snackbar.success('Check-in thủ công thành công!');
      fetchList();
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Check-in thất bại');
    }
  };

  return {
    data,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    fetchList,
    handleManualCheckIn,
  };
};
