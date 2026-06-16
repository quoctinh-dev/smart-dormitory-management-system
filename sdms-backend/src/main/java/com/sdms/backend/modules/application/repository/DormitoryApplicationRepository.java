package com.sdms.backend.modules.application.repository;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DormitoryApplicationRepository extends JpaRepository<DormitoryApplication, UUID>, JpaSpecificationExecutor<DormitoryApplication> {
    Optional<DormitoryApplication> findByApplicationCode(String applicationCode);
    boolean existsByCccdAndRegistrationPeriod_PeriodId(String cccd, UUID periodId);
}
