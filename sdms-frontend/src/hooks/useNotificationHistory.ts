import { useState, useEffect } from 'react';

import { notificationApi } from '@/api/notification-api';
import { snackbar } from '@/helpers/snackbar';
import type { NotificationDeliveryLog } from '@/types/notification';

export const useNotificationHistory = () => {
  const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const [openBroadcast, setOpenBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetAudience: 'ALL',
    type: 'ANNOUNCEMENT',
  });
  const [broadcasting, setBroadcasting] = useState(false);

  const [filter, setFilter] = useState({ keyword: '', type: '', isBroadcast: '' });

  const fetchLogs = async (nextPage: number, size: number, currentFilter: typeof filter) => {
    setLoading(true);
    try {
      const typeParam = currentFilter.type === 'ALL' ? undefined : currentFilter.type || undefined;
      const broadcastParam =
        currentFilter.isBroadcast === 'BROADCAST'
          ? true
          : currentFilter.isBroadcast === 'SYSTEM'
            ? false
            : undefined;

      const data = await notificationApi.getDeliveryLogs(
        nextPage,
        size,
        currentFilter.keyword || undefined,
        typeParam,
        broadcastParam
      );
      setLogs(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (requestError) {
      console.error(requestError);
      snackbar.error('Lỗi khi tải lịch sử thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, rowsPerPage, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filter]);

  const handleBroadcastSubmit = async () => {
    if (!broadcastForm.title || !broadcastForm.message) return;

    setBroadcasting(true);
    try {
      const result = await notificationApi.broadcastNotification(broadcastForm);
      setOpenBroadcast(false);
      setBroadcastForm({ title: '', message: '', targetAudience: 'ALL', type: 'ANNOUNCEMENT' });
      setPage(0);
      snackbar.success(`Đã phát thông báo cho ${result.recipientCount} tài khoản.`);
      fetchLogs(0, rowsPerPage, filter);
    } catch (requestError) {
      console.error(requestError);
      snackbar.error('Lỗi khi gửi broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const sentCount = logs.filter((row) => row.status === 'SENT').length;
  const failedCount = logs.filter((row) => row.status === 'FAILED').length;

  return {
    logs,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalElements,
    openBroadcast,
    setOpenBroadcast,
    broadcastForm,
    setBroadcastForm,
    broadcasting,
    filter,
    setFilter,
    handleBroadcastSubmit,
    sentCount,
    failedCount,
  };
};
