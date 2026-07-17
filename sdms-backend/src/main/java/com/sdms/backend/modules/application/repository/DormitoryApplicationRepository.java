package com.sdms.backend.modules.application.repository;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository quản lý DormitoryApplication (Aggregate Root).
 */
@Repository
public interface DormitoryApplicationRepository
    extends JpaRepository<DormitoryApplication, UUID>, JpaSpecificationExecutor<DormitoryApplication> {

    @Override
    // Đã xóa @EntityGraph để tránh cảnh báo HHH90003004 khi phân trang với fetch collection
    org.springframework.data.domain.Page<DormitoryApplication> findAll(org.springframework.data.domain.Pageable pageable);

    @Query("""
        SELECT a FROM DormitoryApplication a
        WHERE (:status IS NULL OR a.status = :status)
        AND (LOWER(a.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR a.cccd LIKE CONCAT('%', :search, '%') OR a.applicationCode LIKE CONCAT('%', :search, '%'))
    """)
    org.springframework.data.domain.Page<DormitoryApplication> findAllWithFilters(
            @Param("status") ApplicationStatus status,
            @Param("search") String search,
            org.springframework.data.domain.Pageable pageable
    );

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"priorities", "documents"})
    Optional<DormitoryApplication> findByApplicationCode(String applicationCode);
    
    List<DormitoryApplication> findByCccd(String cccd);
    
    List<DormitoryApplication> findByStudentCode(String studentCode);
    
    List<DormitoryApplication> findByEmail(String email);

    boolean existsByCccdAndRegistrationPeriod_PeriodId(String cccd, UUID periodId);
    
    boolean existsByEmailAndRegistrationPeriod_PeriodId(String email, UUID periodId);

    Optional<DormitoryApplication> findByEmailAndRegistrationPeriod_PeriodId(String email, UUID periodId);

    List<DormitoryApplication> findByRegistrationPeriod_PeriodIdAndStatusIn(UUID periodId, List<ApplicationStatus> statuses);

    long countByStatus(ApplicationStatus status);

    @Query("""
        SELECT a FROM DormitoryApplication a 
        WHERE a.status = :status 
        AND a.gender = :gender 
        AND a.waitingListUsed = false
        ORDER BY a.priorityScore DESC, a.createdAt ASC
    """)
    List<DormitoryApplication> findWaitingListCandidates(
            @Param("status") ApplicationStatus status,
            @Param("gender") Gender gender
    );

    @Query("""
        SELECT a.applicationId FROM DormitoryApplication a
        WHERE a.status = :status
        AND a.paymentDeadline < :now
    """)
    List<UUID> findExpiredApplicationIds(
            @Param("status") ApplicationStatus status,
            @Param("now") LocalDateTime now
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM DormitoryApplication a WHERE a.applicationId = :id")
    Optional<DormitoryApplication> findByIdForUpdate(@Param("id") UUID id);
}
