import axiosClient from './axios-client';
import type { PageResponse } from './notification-api';
import { StayExtensionResponse, StayExtensionReviewRequest } from '../types/stay-extension';

const BASE_URL = '/v1/admin/extensions';

export const stayExtensionApi = {
  async getAllExtensions(
    page: number = 0,
    size: number = 10,
    status?: string,
    search?: string
  ): Promise<PageResponse<StayExtensionResponse>> {
    const data = await axiosClient.get<PageResponse<StayExtensionResponse>>(BASE_URL, {
      params: { page, size, status, search },
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
