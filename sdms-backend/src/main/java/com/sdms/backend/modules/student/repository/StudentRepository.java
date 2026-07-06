// 📄 Đường dẫn: src/main/java/com/sdms/backend/modules/student/repository/StudentRepository.java
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
    Optional<Student> findByRfidCode(String rfidCode);
    Optional<Student> findBySourceApplication_ApplicationId(UUID applicationId);
    boolean existsBySourceApplication_ApplicationId(UUID applicationId);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM Student s WHERE s.status = :status AND s.rfidCode IS NOT NULL")
    java.util.List<Student> findByStatusAndRfidCodeIsNotNull(@org.springframework.data.repository.query.Param("status") com.sdms.backend.modules.student.enums.StudentStatus status);
}