/**
 * Shared API types dùng chung cho toàn bộ Frontend.
 */

/** Chuẩn hóa lỗi từ AxiosError để dùng trong catch block */
export interface ApiErrorData {
  message?: string;
  errorCode?: string;
  status?: number;
}

/** Helper: lấy message từ unknown error */
export function getErrorMessage(
  error: unknown,
  fallback = 'Đã xảy ra lỗi không xác định.'
): string {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    / AxiosError response.data.message {4}/;
    if (e['response'] && typeof e['response'] === 'object') {
      const res = e['response'] as Record<string, unknown>;
      if (res['data'] && typeof res['data'] === 'object') {
        const data = res['data'] as Record<string, unknown>;
        if (typeof data['message'] === 'string') return data['message'];
      }
    }
    if (typeof e['message'] === 'string') return e['message'];
  }
  return fallback;
}

/** Kiểm tra xem error có phải AxiosError 404 không */
export function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (e['response'] && typeof e['response'] === 'object') {
      const res = e['response'] as Record<string, unknown>;
      return res['status'] === 404;
    }
  }
  return false;
}
