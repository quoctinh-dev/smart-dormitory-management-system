package com.sdms.backend.modules.student.repository;

import com.sdms.backend.modules.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID>, JpaSpecificationExecutor<Student> {
    Optional<Student> findByStudentCode(String studentCode);
    Optional<Student> findByCccd(String cccd);
    boolean existsByCccd(String cccd);
}
