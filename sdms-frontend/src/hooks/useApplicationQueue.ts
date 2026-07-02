import { useState, useEffect, useCallback } from 'react';

import applicationApi from '@/api/applicationApi';

export interface IApplicationQueueItem {
  applicationId: string;
  fullName: string;
  cccd: string;
  dob: string;
  status: string;
  [key: string]: any;
}

export const useApplicationQueue = () => {
  const [applications, setApplications] = useState<IApplicationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.getAll({ page: 0, size: 50 });
      setApplications((res as any)?.content || (res as any)?.data?.content || []);
    } catch (err: any) {
      console.error('Failed to fetch applications', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách hồ sơ hàng đợi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, loading, error, refreshQueue: fetchApplications };
};
