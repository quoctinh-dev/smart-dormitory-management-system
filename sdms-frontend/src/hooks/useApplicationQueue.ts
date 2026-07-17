import { useState, useEffect, useCallback } from 'react';

import applicationApi from '@/api/applicationApi';
import type { ApplicationResponse } from '@/types/application';
import { snackbar } from '@/utils/snackbar';

export const useApplicationQueue = (
  page: number = 0,
  size: number = 10,
  status: string | null = null,
  search: string = ''
) => {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { page: number; size: number; status?: string; search?: string } = {
        page,
        size,
      };
      if (status) params.status = status;
      if (search) params.search = search;

      const res = await applicationApi.getAll(params);

      setApplications(res.content || []);
      setTotalPages(res.totalPages || Math.ceil((res.totalElements || 0) / size));
    } catch (err: any) {
      console.error('Failed to fetch applications', err);
      snackbar.error(err.response?.data?.message || 'Không thể tải danh sách hồ sơ hàng đợi.');
    } finally {
      setLoading(false);
    }
  }, [page, size, status, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, totalPages, loading, error, refreshQueue: fetchApplications };
};
