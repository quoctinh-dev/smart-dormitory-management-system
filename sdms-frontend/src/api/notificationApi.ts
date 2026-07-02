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
}

export interface BroadcastResponse {
  eventId: string;
  recipientCount: number;
  message: string;
}

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
    size: number = 20
  ): Promise<PageResponse<NotificationDeliveryLog>> {
    const data = await axiosClient.get<PageResponse<NotificationDeliveryLog>>(
      '/v1/admin/notifications/delivery-logs',
      { params: { page, size } }
    );

    return data as unknown as PageResponse<NotificationDeliveryLog>;
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
