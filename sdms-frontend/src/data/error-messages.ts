export const AUTH_ERRORS: Record<string, string> = {
  VALIDATION_FAILED: 'Thông tin cung cấp không hợp lệ. Vui lòng kiểm tra lại.',
  INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  TOKEN_INVALID: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  REFRESH_TOKEN_REVOKED:
    'Phiên đăng nhập không hợp lệ hoặc đã bị chấm dứt. Vui lòng đăng nhập lại.',
  ACCOUNT_PENDING_ACTIVATION: 'Tài khoản của bạn chưa được kích hoạt.',
  ACCOUNT_LOCKED: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản lý.',
  ACCOUNT_ALREADY_ACTIVE: 'Tài khoản này đã được kích hoạt từ trước.',
  INVALID_PASSWORD: 'Mật khẩu cũ không chính xác.',
  TOKEN_INVALID_OR_EXPIRED: 'Đường dẫn khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.',
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền truy cập vào chức năng này.',
  INTERNAL_SERVER_ERROR: 'Hệ thống đang bận xử lý, vui lòng thử lại sau ít phút.',
  DEFAULT: 'Đăng nhập thất bại. Vui lòng kiểm tra kết nối hoặc tài khoản và thử lại.',
};

export const getAuthErrorMessage = (errorCode?: string): string => {
  if (!errorCode) return AUTH_ERRORS.DEFAULT;
  return AUTH_ERRORS[errorCode] || AUTH_ERRORS.DEFAULT;
};
