package com.sdms.backend.modules.student.repository;

import com.sdms.backend.modules.student.entity.StayExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StayExtensionRepository extends JpaRepository<StayExtension, UUID> {

    Optional<StayExtension> findByStudent_StudentCode(String studentCode);

    /**
     * @deprecated Không dùng method này nữa. Dùng existsByStudent_StudentIdAndRegistrationPeriod_PeriodId thay thế.
     * Lý do: Check globally sẽ chặn oan sinh viên muốn gia hạn ở đợt mới sau khi đã gia hạn đợt cũ.
     */
    @Deprecated
    boolean existsByStudent_StudentId(UUID studentId);

    /**
     * [BUSINESS RULE] Kiểm tra xem sinh viên đã nộp đơn gia hạn trong đợt đăng ký này chưa.
     * Cho phép sinh viên gia hạn nhiều lần ở các ĐỢT KHÁC NHAU (các kỳ học khác nhau).
     */
    boolean existsByStudent_StudentIdAndRegistrationPeriod_PeriodId(UUID studentId, UUID periodId);

    /**
     * Lấy đơn gia hạn của sinh viên trong 1 đợt cụ thể.
     */
    Optional<StayExtension> findByStudent_StudentIdAndRegistrationPeriod_PeriodId(UUID studentId, UUID periodId);
}
