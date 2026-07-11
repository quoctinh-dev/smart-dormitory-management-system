import axiosClient from './axiosClient';

const BASE_URL = '/v1/room-pins';

const roomPinApi = {
  /**
   * Lấy PIN hiện tại của 1 phòng.
   */
  getRoomPin(roomId: string): Promise<any> {
    return axiosClient.get(`${BASE_URL}/${roomId}`);
  },

  /**
   * Reset PIN cho 1 phòng cụ thể.
   */
  resetRoomPin(roomId: string): Promise<any> {
    return axiosClient.post(`${BASE_URL}/${roomId}/reset`);
  },

  /**
   * Sinh PIN hàng loạt cho tất cả phòng CHƯA có PIN.
   */
  bulkGeneratePins(): Promise<any> {
    return axiosClient.post(`${BASE_URL}/bulk-generate`);
  },

  /**
   * Reset PIN hàng loạt cho TẤT CẢ phòng.
   */
  bulkResetAllPins(): Promise<any> {
    return axiosClient.post(`${BASE_URL}/bulk-reset`);
  },
};

export default roomPinApi;
