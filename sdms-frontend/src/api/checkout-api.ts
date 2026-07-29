import axiosClient from './axios-client';
import type { PageResponse } from './notification-api';
import { CheckoutRequestResponse, CheckoutRequestReviewDto } from '../types/checkout';

const BASE_URL = '/v1/admin/checkout-requests';

export const checkoutApi = {
  async getAllCheckoutRequests(
    status?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<CheckoutRequestResponse>> {
    const data = await axiosClient.get<PageResponse<CheckoutRequestResponse>>(BASE_URL, {
      params: { status, startDate, endDate, page, size },
    });
    return data as unknown as PageResponse<CheckoutRequestResponse>;
  },

  async reviewCheckoutRequest(
    requestId: string,
    data: CheckoutRequestReviewDto
  ): Promise<CheckoutRequestResponse> {
    const response = await axiosClient.post<CheckoutRequestResponse>(
      `${BASE_URL}/${requestId}/review`,
      data
    );
    return response as unknown as CheckoutRequestResponse;
  },

  async bulkReviewCheckoutRequests(
    requestIds: string[],
    status: 'APPROVED' | 'REJECTED' | 'COMPLETED'
  ): Promise<number> {
    const response = await axiosClient.post<number>(`${BASE_URL}/bulk-review`, {
      requestIds,
      status,
    });
    return response as unknown as number;
  },
};

export default checkoutApi;
