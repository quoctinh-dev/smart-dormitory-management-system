package com.sdms.backend.modules.registration.repository;

import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationPeriodRepository extends JpaRepository<RegistrationPeriod, UUID> {
    Optional<RegistrationPeriod> findFirstByIsActiveTrueOrderByStartDateDesc();
}
