import { beforeEach, describe, expect, it, vi } from 'vitest';

import axiosClient from './axiosClient';
import { notificationApi } from './notificationApi';

vi.mock('./axiosClient', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

const getMock = axiosClient.get as unknown as ReturnType<typeof vi.fn>;
const patchMock = axiosClient.patch as unknown as ReturnType<typeof vi.fn>;
const postMock = axiosClient.post as unknown as ReturnType<typeof vi.fn>;

describe('notificationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads unread count from the authenticated notification endpoint', async () => {
    getMock.mockResolvedValueOnce(5);

    const result = await notificationApi.getUnreadCount();

    expect(getMock).toHaveBeenCalledWith('/v1/notifications/unread-count');
    expect(result).toBe(5);
  });

  it('marks all notifications as read without sending a userId param', async () => {
    patchMock.mockResolvedValueOnce(undefined);

    await notificationApi.markAllAsRead();

    expect(patchMock).toHaveBeenCalledWith('/v1/notifications/read-all');
  });

  it('posts broadcast requests to the admin notification endpoint', async () => {
    const payload = {
      title: 'System maintenance',
      message: 'The portal will be unavailable tonight.',
      targetAudience: 'ALL',
      type: 'ANNOUNCEMENT',
    };

    const response = {
      eventId: 'broadcast-123',
      recipientCount: 42,
      message: 'Broadcast notification created successfully.',
    };

    postMock.mockResolvedValueOnce(response);

    const result = await notificationApi.broadcastNotification(payload);

    expect(postMock).toHaveBeenCalledWith('/v1/admin/notifications/broadcast', payload);
    expect(result).toEqual(response);
  });
});
