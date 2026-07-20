import axiosClient from './axios-client';

const DOC_URL = '/v1/documents';

export interface DocumentUploadResponse {
  documentId: string;
  url: string;
  type: string;
}

const documentApi = {
  /**
   * Tải tài liệu minh chứng lên hệ thống (CCCD, Ảnh 3x4, Giấy ưu tiên...)
   * @param appId - ID của hồ sơ đăng ký
   * @param type - Loại tài liệu (ví dụ: 'CCCD_FRONT', 'PROFILE_3X4')
   * @param file - Đối tượng file thực tế từ input
   */
  upload(appId: string, type: string, file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return axiosClient.post(`${DOC_URL}/upload/${appId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default documentApi;
