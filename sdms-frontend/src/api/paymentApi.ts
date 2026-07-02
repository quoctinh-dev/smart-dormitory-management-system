// @ts-nocheck
import axiosClient from './axiosClient';

export const paymentApi = {
  // 1. Quản lý hóa đơn (Dùng chung hoặc Admin)
  getAllBills: async () => {
    return await axiosClient.get('/v1/bills');
  },

  getBillByApplication: async (applicationId) => {
    return await axiosClient.get(`/v1/bills/application/${applicationId}`);
  },

  // 2. Xử lý thanh toán
  processOnlinePayment: async (data) => {
    return await axiosClient.post('/v1/payments/online', data); // Updated path
  },

  approveCashPayment: async (data) => {
    return await axiosClient.post('/v1/payments/cash/approve', data); // Updated path
  },

  // 3. Lấy hướng dẫn thanh toán
  getPaymentInstructions: async () => {
    return await axiosClient.get('/v1/public/payment-instructions');
  },

  // Mock payment success for testing event-driven flow
  mockPaymentSuccess: async (applicationId) => {
    return await axiosClient.post(`/v1/payments/mock-success/${applicationId}`);
  },
};

export default paymentApi;
