import axiosClient from './axiosClient';

const BASE_URL = '/v1/room-pins';

export interface RoomPinResponse {
  roomId: string;
  pin: string;
  generatedAt: string;
}

export interface BulkPinResult {
  processed: number;
  generatedCount: number;
  skipped: number;
  message: string;
}

const roomPinApi = {
  /**
   * Lấy PIN hiện tại của 1 phòng.
   */
  getRoomPin(roomId: string): Promise<RoomPinResponse> {
    return axiosClient.get(`${BASE_URL}/${roomId}`);
  },

  /**
   * Reset PIN cho 1 phòng cụ thể.
   */
  resetRoomPin(roomId: string): Promise<RoomPinResponse> {
    return axiosClient.post(`${BASE_URL}/${roomId}/reset`);
  },

  /**
   * Sinh PIN hàng loạt cho tất cả phòng CHƯA có PIN.
   */
  bulkGeneratePins(): Promise<BulkPinResult> {
    return axiosClient.post(`${BASE_URL}/bulk-generate`);
  },

  /**
   * Reset PIN hàng loạt cho TẤT CẢ phòng.
   */
  bulkResetAllPins(): Promise<BulkPinResult> {
    return axiosClient.post(`${BASE_URL}/bulk-reset`);
  },
};

export default roomPinApi;
