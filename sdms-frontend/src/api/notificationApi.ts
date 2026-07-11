import axiosClient from './axiosClient';

const BASE_URL = '/v1/notifications';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationDeliveryLog {
  id: number;
  eventId: string;
  recipient: string;
  channel: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

export interface BroadcastRequest {
  title: string;
  message: string;
  targetAudience: string;
  type: string;
}

export interface BroadcastResponse {
  eventId: string;
  recipientCount: number;
  message: string;
}

const normalizePageResponse = <T>(payload: any): PageResponse<T> => {
  const source = payload?.data ?? payload;
  const content = Array.isArray(source?.content)
    ? source.content
    : Array.isArray(source?.items)
      ? source.items
      : Array.isArray(source?.data?.content)
        ? source.data.content
        : [];

  const totalElements =
    typeof source?.totalElements === 'number'
      ? source.totalElements
      : typeof source?.total === 'number'
        ? source.total
        : typeof source?.count === 'number'
          ? source.count
          : typeof source?.totalCount === 'number'
            ? source.totalCount
            : typeof source?.data?.totalElements === 'number'
              ? source.data.totalElements
              : content.length;

  const totalPages =
    typeof source?.totalPages === 'number'
      ? source.totalPages
      : typeof source?.data?.totalPages === 'number'
        ? source.data.totalPages
        : Math.max(1, Math.ceil(totalElements / 20));

  return {
    content: content as T[],
    totalElements,
    totalPages,
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
    const params: Record<string, any> = { page, size };
    if (keyword) params.keyword = keyword;
    if (type) params.type = type;
    if (isBroadcast !== undefined) params.isBroadcast = isBroadcast;

    const data = await axiosClient.get<any>(
      '/v1/admin/notifications/delivery-logs',
      { params }
    );
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
