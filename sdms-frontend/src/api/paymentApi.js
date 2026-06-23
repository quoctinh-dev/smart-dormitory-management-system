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
    return await axiosClient.post('/payments/online', data);
  },

  approveCashPayment: async (data) => {
    return await axiosClient.post('/payments/cash/approve', data);
  }
};

export default paymentApi;