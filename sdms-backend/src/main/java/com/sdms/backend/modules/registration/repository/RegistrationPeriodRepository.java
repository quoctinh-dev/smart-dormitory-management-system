package com.sdms.backend.modules.registration.repository;

import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationPeriodRepository extends JpaRepository<RegistrationPeriod, UUID> {

    List<RegistrationPeriod> findByIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDateTime now1,
            LocalDateTime now2
    );

    @Modifying
    @Transactional
    @Query("UPDATE RegistrationPeriod p SET p.isActive = false WHERE p.isActive = true")
    void deactivateAll();
}