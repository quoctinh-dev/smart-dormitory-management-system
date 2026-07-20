import axiosClient from './axios-client';
import type { PageResponse } from './notification-api';
import { CheckoutRequestResponse, CheckoutRequestReviewDto } from '../types/checkout';

const BASE_URL = '/v1/admin/checkout-requests';

export const checkoutApi = {
  async getAllCheckoutRequests(
    status?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<CheckoutRequestResponse>> {
    const data = await axiosClient.get<PageResponse<CheckoutRequestResponse>>(BASE_URL, {
      params: { status, page, size },
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
};

export default checkoutApi;
