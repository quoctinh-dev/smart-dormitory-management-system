package com.sdms.backend.modules.registration.repository;

import com.sdms.backend.modules.registration.entity.RegistrationEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationEligibilityRepository
        extends JpaRepository<RegistrationEligibility, UUID> {

    // Lấy danh sách eligibility theo đợt (Cần thiết cho STEP 7)
    List<RegistrationEligibility> findByRegistrationPeriod_PeriodId(UUID periodId);

    boolean existsByRegistrationPeriod_PeriodIdAndCccd(
            UUID periodId,
            String cccd
    );

    Optional<RegistrationEligibility>
    findByRegistrationPeriod_PeriodIdAndCccd(
            UUID periodId,
            String cccd
    );

    @Modifying
    @Transactional
    void deleteByEligibilityId(UUID eligibilityId);
}