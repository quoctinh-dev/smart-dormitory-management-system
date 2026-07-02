package com.sdms.backend.modules.student.repository;

import com.sdms.backend.modules.student.entity.StayExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StayExtensionRepository extends JpaRepository<StayExtension, UUID> {
    Optional<StayExtension> findByStudent_StudentCode(String studentCode);
    boolean existsByStudent_StudentId(UUID studentId);
}
