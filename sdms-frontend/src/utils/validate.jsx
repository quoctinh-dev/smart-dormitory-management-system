/**
 * Kiểm tra mật khẩu chuẩn bảo mật hệ thống
 * Quy tắc: Từ 8-50 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt
 * @param {string} password 
 * @returns {boolean}
 */
export const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?=\S+$).{8,50}$/;
  return regex.test(password);
};