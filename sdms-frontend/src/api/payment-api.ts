import type {
  BillResponse,
  BillAdminResponse,
  PaymentInstruction,
  PageResponse,
  OnlinePaymentRequest,
  PaymentActionResponse,
} from '@/types/payment';

import axiosClient from './axios-client';

export const paymentApi = {
  // 1. Quản lý hóa đơn (Dùng chung hoặc Admin)
  getAllBills: async (): Promise<PageResponse<BillAdminResponse>> => {
    return await axiosClient.get('/v1/bills');
  },

  getBillByApplication: async (applicationId: string): Promise<BillResponse> => {
    return await axiosClient.get(`/v1/bills/application/${applicationId}`);
  },

  createManualBill: async (data: {
    studentId: string;
    roomId?: string;
    amount: number;
    description: string;
    billType: string;
    dueDate: string;
  }): Promise<BillResponse> => {
    return await axiosClient.post('/v1/bills/manual', data);
  },

  // 2. Xử lý thanh toán
  processOnlinePayment: async (data: OnlinePaymentRequest): Promise<PaymentActionResponse> => {
    return await axiosClient.post('/v1/payments/online', data);
  },

  approveCashPayment: async (data: {
    billId: string;
    amount: number;
  }): Promise<PaymentActionResponse> => {
    return await axiosClient.post('/v1/payments/cash/approve', data);
  },

  // 3. Lấy hướng dẫn thanh toán
  getPaymentInstructions: async (): Promise<PaymentInstruction> => {
    return await axiosClient.get('/v1/public/payment-instructions');
  },

};

export default paymentApi;
