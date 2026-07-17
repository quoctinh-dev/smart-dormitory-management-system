package com.sdms.backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
/**
 * Cấu trúc phản hồi chuẩn (API Contract) cho toàn bộ API của hệ thống.
 * Đảm bảo tính nhất quán về định dạng dữ liệu trả về giữa Backend và Frontend/Mobile.
 *
 * @param <T> Kiểu dữ liệu của payload trả về nằm trong thuộc tính data
 */
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String errorCode;

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /**
     * Khởi tạo phản hồi thành công chứa dữ liệu kèm thông báo tùy chỉnh.
     *
     * @param message Thông báo trả về cho client
     * @param data Dữ liệu nghiệp vụ trả về
     * @param <T> Kiểu dữ liệu của payload
     * @return Đối tượng ApiResponse đóng gói kết quả thành công
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * Khởi tạo phản hồi thành công chứa dữ liệu với thông báo mặc định.
     *
     * @param data Dữ liệu nghiệp vụ trả về
     * @param <T> Kiểu dữ liệu của payload
     * @return Đối tượng ApiResponse đóng gói kết quả thành công
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Thao tác thành công", data);
    }

    /**
     * Khởi tạo phản hồi thành công chỉ kèm theo thông báo, không có dữ liệu trả về.
     * Thường dùng cho các tác vụ cập nhật, xóa hoặc kích hoạt trạng thái.
     *
     * @param message Thông báo trả về cho client
     * @param <T> Kiểu dữ liệu (thường là Void)
     * @return Đối tượng ApiResponse đóng gói kết quả thành công
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }
}