import axiosClient from './axios-client';

const BASE_URL = '/v1/notifications';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

import {
  NotificationResponse,
  NotificationDeliveryLog,
  BroadcastRequest,
  BroadcastResponse,
} from '../types/notification';

const normalizePageResponse = <T>(payload: unknown): PageResponse<T> => {
  const raw = payload as Record<string, unknown>;
  const source = (raw?.['data'] ?? raw) as Record<string, unknown>;
  const content = Array.isArray(source?.['content'])
    ? source['content']
    : Array.isArray(source?.['items'])
      ? source['items']
      : Array.isArray((source?.['data'] as Record<string, unknown>)?.['content'])
        ? (source['data'] as Record<string, unknown>)['content']
        : [];

  const totalElements =
    typeof source?.['totalElements'] === 'number'
      ? source['totalElements']
      : typeof source?.['total'] === 'number'
        ? source['total']
        : typeof source?.['count'] === 'number'
          ? source['count']
          : typeof source?.['totalCount'] === 'number'
            ? source['totalCount']
            : typeof (source?.['data'] as Record<string, unknown>)?.['totalElements'] === 'number'
              ? (source['data'] as Record<string, unknown>)['totalElements']
              : (content as unknown[]).length;

  const totalPages =
    typeof source?.['totalPages'] === 'number'
      ? source['totalPages']
      : typeof (source?.['data'] as Record<string, unknown>)?.['totalPages'] === 'number'
        ? (source['data'] as Record<string, unknown>)['totalPages']
        : Math.max(1, Math.ceil((totalElements as number) / 20));

  return {
    content: content as T[],
    totalElements: totalElements as number,
    totalPages: totalPages as number,
  };
};

export const notificationApi = {
  async getNotifications(): Promise<NotificationResponse[]> {
    const data = await axiosClient.get<NotificationResponse[]>(BASE_URL);
    return data as unknown as NotificationResponse[];
  },

  async getUnreadCount(): Promise<number> {
    const data = await axiosClient.get<number>(`${BASE_URL}/unread-count`);
    return data as unknown as number;
  },

  async markAsRead(id: string | number): Promise<void> {
    await axiosClient.patch<void>(`${BASE_URL}/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await axiosClient.patch<void>(`${BASE_URL}/read-all`);
  },

  async getDeliveryLogs(
    page: number = 0,
    size: number = 20,
    keyword?: string,
    type?: string,
    isBroadcast?: boolean
  ): Promise<PageResponse<NotificationDeliveryLog>> {
    const params: Record<string, string | number | boolean> = { page, size };
    if (keyword) params.keyword = keyword;
    if (type) params.type = type;
    if (isBroadcast !== undefined) params.isBroadcast = isBroadcast;

    const data = await axiosClient.get('/v1/admin/notifications/delivery-logs', { params });
    return normalizePageResponse<NotificationDeliveryLog>(data);
  },

  async broadcastNotification(request: BroadcastRequest): Promise<BroadcastResponse> {
    const data = await axiosClient.post<BroadcastResponse>(
      '/v1/admin/notifications/broadcast',
      request
    );
    return data as unknown as BroadcastResponse;
  },
};

export default notificationApi;
