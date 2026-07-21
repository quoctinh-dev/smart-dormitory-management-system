import { useState, useEffect, useCallback } from 'react';
import dashboardApi from '@/api/dashboard-api';
import type { DashboardStatsResponse, ExpiringAssignmentDto } from '@/types/dashboard';
import { snackbar } from '@/helpers/snackbar';

export const useAdminDashboard = () => {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [expiringList, setExpiringList] = useState<ExpiringAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // AxiosClient unwraps the data automatically
      const [statsRes, expiringRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getExpiringAssignments(7)
      ]);
      setData(statsRes as any);
      setExpiringList(expiringRes as any);
    } catch (err: unknown) {
      const msg = (err as any)?.message || 'Lỗi khi tải dữ liệu dashboard';
      snackbar.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    expiringList,
    loading,
    refetch: fetchStats
  };
};
