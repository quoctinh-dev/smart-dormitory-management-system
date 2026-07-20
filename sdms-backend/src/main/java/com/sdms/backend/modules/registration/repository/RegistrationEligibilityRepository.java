package com.sdms.backend.modules.registration.repository;

import com.sdms.backend.modules.registration.entity.RegistrationEligibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface RegistrationEligibilityRepository
        extends JpaRepository<RegistrationEligibility, UUID> {

    // 1. Tìm kiếm và phân trang với Keyword (CCCD, Họ tên, MSSV, Email)
    @Query("SELECT e FROM RegistrationEligibility e WHERE e.registrationPeriod.periodId = :periodId AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.cccd) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.studentCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<RegistrationEligibility> searchEligibilities(@Param("periodId") UUID periodId, @Param("keyword") String keyword, Pageable pageable);

    // 2. Chỉ lấy danh sách chuỗi CCCD dạng Set để check trùng cực nhanh trên RAM, khử lỗi N+1 queries
    @Query("SELECT e.studentCode FROM RegistrationEligibility e WHERE e.registrationPeriod.periodId = :periodId")
    Set<String> findStudentCodeByRegistrationPeriod_PeriodId(@Param("periodId") UUID periodId);

    // 3. Giữ lại phục vụ cho logic kiểm tra điều kiện (CheckEligibility) lúc sinh viên đăng ký công khai
    Optional<RegistrationEligibility> findByRegistrationPeriod_PeriodIdAndEmail(UUID periodId, String email);
    
    Optional<RegistrationEligibility> findByRegistrationPeriod_PeriodIdAndStudentCode(UUID periodId, String studentCode);

    // 4. Kiểm tra nhanh sự tồn tại (Giữ lại nếu module khác cần dùng)
    boolean existsByRegistrationPeriod_PeriodIdAndEmail(UUID periodId, String email);
    
    boolean existsByRegistrationPeriod_PeriodIdAndStudentCode(UUID periodId, String studentCode);

    // 5. Hàm xóa theo ID (Giữ nguyên cấu hình cũ của bạn)
    @Modifying
    @Transactional
    void deleteByEligibilityId(UUID eligibilityId);

    // 6. Xóa tất cả sinh viên trong đợt
    @Modifying
    @Transactional
    @Query("DELETE FROM RegistrationEligibility e WHERE e.registrationPeriod.periodId = :periodId")
    void deleteAllByRegistrationPeriod_PeriodId(@Param("periodId") UUID periodId);
}