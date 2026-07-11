package com.sdms.backend.modules.smartaccess.domain.repository;

import com.sdms.backend.modules.smartaccess.domain.entity.Gate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GateRepository extends JpaRepository<Gate, UUID> {
}
