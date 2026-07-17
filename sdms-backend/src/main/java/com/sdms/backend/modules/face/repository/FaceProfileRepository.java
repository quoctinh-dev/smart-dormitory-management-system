package com.sdms.backend.modules.face.repository;

import com.sdms.backend.modules.face.entity.FaceProfile;
import com.sdms.backend.modules.face.enums.FaceProfileStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository cho root aggregate {@link FaceProfile}.
 *
 * <p>Quyền sở hữu: Chỉ thuộc Module Face.
 * KHÔNG inject repository này vào bất kỳ module nào khác một cách trực tiếp.
 * Đọc dữ liệu chéo module phải thông qua một interface port chuyên dụng.
 */
@Repository
public interface FaceProfileRepository extends JpaRepository<FaceProfile, UUID> {

    /**
     * Tìm kiếm hồ sơ khuôn mặt cho một sinh viên nhất định.
     * Được sử dụng để thực thi kiểm tra quan hệ 1:0..1 trước khi tạo một hồ sơ mới.
     */
    Optional<FaceProfile> findByStudentId(UUID studentId);

    /**
     * Trả về true nếu tồn tại bất kỳ bản ghi FaceProfile nào cho sinh viên nhất định.
     * Được sử dụng để kiểm tra tồn tại nhanh trước khi tải lên mà không cần load entity.
     */
    boolean existsByStudentId(UUID studentId);

    /**
     * Trả về danh sách hồ sơ được phân trang theo trạng thái.
     * Trường hợp sử dụng chính: Hàng đợi duyệt của Admin — {@code findByStatus(PENDING, pageable)}.
     * Kết quả được sắp xếp theo {@code created_at ASC} để thực thi thứ tự duyệt FIFO
     * via {@code Pageable} (e.g., {@code PageRequest.of(0, 20, Sort.by("createdAt").ascending())}).
     */
    Page<FaceProfile> findByStatus(FaceProfileStatus status, Pageable pageable);

    /**
     * Trả về danh sách hồ sơ phân trang đang CHỜ DUYỆT hoặc có yêu cầu thay thế đang chờ duyệt.
     * Được sử dụng cho Hàng đợi Admin thống nhất.
     */
    Page<FaceProfile> findByStatusOrPendingFaceImageUrlIsNotNull(FaceProfileStatus status, Pageable pageable);
}
