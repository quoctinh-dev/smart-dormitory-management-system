package com.sdms.backend.modules.face.repository;

import com.sdms.backend.modules.face.entity.FaceVerificationAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Repository cho {@link FaceVerificationAttempt} — một sổ cái kiểm toán chỉ-thêm.
 *
 * <p><b>TUÂN THỦ CHỈ-THÊM:</b> Interface này cố tình kế thừa
 * {@link Repository} (không phải {@code JpaRepository}) để CHỈ expose {@code save()}
 * và các phương thức đọc. Các thao tác xóa và cập nhật bị cấm về mặt cấu trúc,
 * phản ánh pattern được sử dụng bởi {@code AccessHistoryRepository}.
 *
 * <p>Mọi lần quét cổng phải được lưu giữ bất kể kết quả.
 * Bản ghi không bao giờ được phép thay đổi hoặc xóa. Dọn dẹp lưu trữ dữ liệu được
 * xử lý bởi một cron job lưu trữ — không phải bởi repository này.
 */
@Component
public interface FaceVerificationAttemptRepository extends Repository<FaceVerificationAttempt, UUID> {

    /**
     * Lưu giữ một bản ghi lần thử xác thực mới.
     * Thao tác ghi duy nhất được phép trên sổ cái này.
     */
    FaceVerificationAttempt save(FaceVerificationAttempt attempt);

    /**
     * Trả về các lần thử xác thực được phân trang cho một hồ sơ khuôn mặt cụ thể.
     * Sử dụng: Chế độ xem kiểm toán của Admin về tất cả các lần quét cổng của một sinh viên.
     */
    Page<FaceVerificationAttempt> findByProfileId(UUID profileId, Pageable pageable);

    /**
     * Trả về các lần thử xác thực được phân trang cho một thiết bị cổng vật lý cụ thể.
     * Sử dụng: Điều tra bảo mật log hoạt động của một cổng cụ thể.
     */
    Page<FaceVerificationAttempt> findByGateDeviceId(String gateDeviceId, Pageable pageable);
}
