import axiosClient from './axiosClient';
import type {
  ApplicationResponse,
  ApplicationCreateRequest,
  PageResponse,
} from '../types/application';

const APP_URL = '/v1/applications';
const ADMIN_APP_URL = '/v1/admin/applications';
const UPLOADS_URL = '/v1/uploads';

const applicationApi = {
  create(data: ApplicationCreateRequest): Promise<{ applicationId: string }> {
    return axiosClient.post(APP_URL, data);
  },

  getById(id: string): Promise<ApplicationResponse> {
    return axiosClient.get(`${APP_URL}/${id}`);
  },

  getAll(params: {
    page?: number;
    size?: number;
    status?: string | null;
    search?: string;
  }): Promise<PageResponse<ApplicationResponse>> {
    return axiosClient.get(APP_URL, { params });
  },

  getStatus({ studentCode }: { studentCode: string }): Promise<ApplicationResponse[]> {
    return axiosClient.get(`${APP_URL}/status`, { params: { studentCode } });
  },

  approve(id: string, note = 'Approved via Web'): Promise<void> {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/approve`, { note });
  },

  reject(id: string, note = 'Rejected via Web'): Promise<void> {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/reject`, { note });
  },

  requestRevision(
    id: string,
    note = 'Please review your documents',
    deadlineDays = 3
  ): Promise<void> {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/request-revision`, { note, deadlineDays });
  },

  confirmPayment(id: string, note = 'Đã thu tiền mặt'): Promise<void> {
    return axiosClient.patch(`${ADMIN_APP_URL}/${id}/confirm-payment`, { note });
  },

  submit(id: string): Promise<void> {
    return axiosClient.post(`${APP_URL}/${id}/submit`);
  },

  uploadDocument(id: string, type: string, fileUrl: string): Promise<void> {
    return axiosClient.post(`${APP_URL}/${id}/documents`, null, {
      params: { type, fileUrl },
    });
  },

  resubmitDocument(applicationId: string, documentId: string, fileUrl: string): Promise<void> {
    return axiosClient.put(`${APP_URL}/${applicationId}/documents/${documentId}/resubmit`, null, {
      params: { fileUrl },
    });
  },

  verifyDocument(documentId: string, status: string, note: string): Promise<void> {
    return axiosClient.patch(`${ADMIN_APP_URL}/documents/${documentId}/verify`, { status, note });
  },

  uploadFileToCloud(formData: FormData): Promise<{ url: string }> {
    return axiosClient.post(`${UPLOADS_URL}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default applicationApi;
