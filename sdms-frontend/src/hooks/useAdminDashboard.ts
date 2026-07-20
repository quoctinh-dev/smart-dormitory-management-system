import { useState, useEffect, useCallback } from 'react';
import dashboardApi from '@/api/dashboard-api';
import type { DashboardStatsResponse } from '@/types/dashboard';
import { snackbar } from '@/helpers/snackbar';

export const useAdminDashboard = () => {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // AxiosClient unwraps the data automatically
      const res = await dashboardApi.getStats();
      setData(res as any);
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
    loading,
    refetch: fetchStats
  };
};
