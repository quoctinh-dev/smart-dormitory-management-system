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
  getAllBills: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    billType?: string;
    requiresRefund?: boolean;
  }): Promise<PageResponse<BillAdminResponse>> => {
    return await axiosClient.get('/v1/bills', { params });
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

  extendDueDate: async (billId: string, data: {
    newDueDate: string;
  }): Promise<BillResponse> => {
    return await axiosClient.put(`/v1/bills/${billId}/extend-due-date`, data);
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
  getPaymentInstructions: async (billId?: string): Promise<PaymentInstruction> => {
    return await axiosClient.get('/v1/public/payment-instructions', {
      params: billId ? { billId } : undefined
    });
  },

};

export default paymentApi;
