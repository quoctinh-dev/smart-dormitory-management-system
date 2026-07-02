import axiosClient from './axiosClient';
import type { PageResponse } from './notificationApi';

export interface StayExtensionResponse {
  extensionId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  currentBedId: string;
  currentBedCode: string;
  currentRoomCode: string;
  pdfUrl: string | null;
  description: string;
  rejectReason: string | null;
  oldExpectedCheckOutAt: string;
  newExpectedCheckOutAt: string;
}

export interface StayExtensionReviewRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectReason?: string;
}

const BASE_URL = '/v1/admin/extensions';

export const stayExtensionApi = {
  async getAllExtensions(
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<StayExtensionResponse>> {
    const data = await axiosClient.get<PageResponse<StayExtensionResponse>>(BASE_URL, {
      params: { page, size },
    });
    return data as unknown as PageResponse<StayExtensionResponse>;
  },

  async reviewExtension(
    id: string,
    request: StayExtensionReviewRequest
  ): Promise<StayExtensionResponse> {
    const data = await axiosClient.put<StayExtensionResponse>(`${BASE_URL}/${id}/status`, request);
    return data as unknown as StayExtensionResponse;
  },
};

export default stayExtensionApi;
