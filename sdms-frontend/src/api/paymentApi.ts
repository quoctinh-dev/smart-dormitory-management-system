import axiosClient from './axiosClient';
import type { BillResponse, BillAdminResponse, PaymentInstruction, PageResponse } from '@/types/payment';

export const paymentApi = {
  // 1. Quản lý hóa đơn (Dùng chung hoặc Admin)
  getAllBills: async (): Promise<PageResponse<BillAdminResponse>> => {
    return await axiosClient.get('/v1/bills');
  },

  getBillByApplication: async (applicationId: string): Promise<BillResponse> => {
    return await axiosClient.get(`/v1/bills/application/${applicationId}`);
  },

  // 2. Xử lý thanh toán
  processOnlinePayment: async (data: any): Promise<any> => {
    return await axiosClient.post('/v1/payments/online', data); // Updated path
  },

  approveCashPayment: async (data: { billId: string; amount: number }): Promise<any> => {
    return await axiosClient.post('/v1/payments/cash/approve', data); // Updated path
  },

  // 3. Lấy hướng dẫn thanh toán
  getPaymentInstructions: async (): Promise<PaymentInstruction> => {
    return await axiosClient.get('/v1/public/payment-instructions');
  },

  // Mock payment success for testing event-driven flow
  mockPaymentSuccess: async (applicationId: string): Promise<any> => {
    return await axiosClient.post(`/v1/payments/mock-success/${applicationId}`);
  },
};

export default paymentApi;
