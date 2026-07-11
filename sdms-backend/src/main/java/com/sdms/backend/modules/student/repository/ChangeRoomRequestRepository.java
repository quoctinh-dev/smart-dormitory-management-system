package com.sdms.backend.modules.student.repository;

import com.sdms.backend.modules.student.entity.ChangeRoomRequest;
import com.sdms.backend.modules.student.enums.ChangeRoomRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChangeRoomRequestRepository extends JpaRepository<ChangeRoomRequest, Long> {
    List<ChangeRoomRequest> findByStudent_StudentId(UUID studentId);
    
    Page<ChangeRoomRequest> findByStatus(ChangeRoomRequestStatus status, Pageable pageable);
    
    boolean existsByStudent_StudentIdAndStatus(UUID studentId, ChangeRoomRequestStatus status);
}
