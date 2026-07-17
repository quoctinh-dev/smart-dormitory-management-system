package com.sdms.backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
/**
 * Lớp bọc (Wrapper) chuẩn hóa cấu trúc dữ liệu phân trang.
 * Dùng để loại bỏ các siêu dữ liệu dư thừa từ Spring Data Page, tối ưu hóa kích thước payload
 * và đồng bộ định dạng phân trang với client.
 *
 * @param <T> Kiểu dữ liệu của các phần tử trong trang
 */
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

    /**
     * Chuyển đổi từ đối tượng Page của Spring Data sang PageResponse chuẩn của hệ thống,
     * đồng thời cho phép mapping lại danh sách nội dung (ví dụ: từ Entity sang DTO).
     *
     * @param page Đối tượng Page nguyên bản từ Spring Data
     * @param content Danh sách dữ liệu đã qua xử lý (thường là DTO list)
     * @param <T> Kiểu dữ liệu của các phần tử trong danh sách
     * @return Đối tượng PageResponse chuẩn hóa
     */
    public static <T> PageResponse<T> fromPage(Page<?> page, List<T> content) {
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    /**
     * Chuyển đổi trực tiếp từ đối tượng Page của Spring Data sang PageResponse chuẩn của hệ thống.
     * Giữ nguyên cấu trúc dữ liệu bên trong Page.
     *
     * @param page Đối tượng Page chứa dữ liệu trực tiếp trả về cho client
     * @param <T> Kiểu dữ liệu của các phần tử trong danh sách
     * @return Đối tượng PageResponse chuẩn hóa
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return fromPage(page, page.getContent());
    }
}
