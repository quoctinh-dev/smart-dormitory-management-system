package com.sdms.backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lớp wrapper chuẩn hóa cho tất cả các phản hồi API.
 * Cung cấp một cấu trúc nhất quán cho client.
 *
 * @param <T> Kiểu dữ liệu của payload (phần data).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
}