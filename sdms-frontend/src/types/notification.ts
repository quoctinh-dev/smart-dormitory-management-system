// src/types/notification.ts
export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt?: string;
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
