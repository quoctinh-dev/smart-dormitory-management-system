package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentHousingAssignmentRepository extends JpaRepository<StudentHousingAssignment, UUID> {
    Optional<StudentHousingAssignment> findByApplication_ApplicationIdAndStatusIn(UUID applicationId, Collection<AssignmentStatus> statuses);

    Optional<StudentHousingAssignment> findByApplication_ApplicationId(UUID applicationId);

    @Query("select a from StudentHousingAssignment a where a.assignmentId = :id")
    Optional<StudentHousingAssignment> findByIdForUpdate(UUID id);
    
    Optional<StudentHousingAssignment> findByAssignmentId(UUID assignmentId);

    Optional<StudentHousingAssignment> findByStudent_CccdAndStatus(String cccd, AssignmentStatus status);

    Optional<StudentHousingAssignment> findByStudent_StudentIdAndStatus(UUID studentId, AssignmentStatus status);

    boolean existsByApplication_ApplicationIdAndStatusIn(UUID applicationId, Collection<AssignmentStatus> statuses);

    boolean existsByStudent_StudentIdAndStatusIn(UUID studentId, Collection<AssignmentStatus> statuses);

    boolean existsByBed_BedIdAndStatusIn(UUID bedId, Collection<AssignmentStatus> statuses);

    boolean existsByBed_Room_Floor_FloorIdAndStatusIn(UUID floorId, Collection<AssignmentStatus> statuses);

    boolean existsByBed_Room_RoomIdAndStatusIn(UUID roomId, Collection<AssignmentStatus> statuses);

    boolean existsByBed_Room_Floor_Building_BuildingIdAndStatusIn(UUID buildingId, Collection<AssignmentStatus> statuses);

    Optional<StudentHousingAssignment> findByBed_BedIdAndStatusIn(UUID bedId, Collection<AssignmentStatus> statuses);

    long countByBed_Room_RoomIdAndStatus(UUID roomId, AssignmentStatus status);

    long countByStatus(AssignmentStatus status);

    List<StudentHousingAssignment> findByBed_Room_RoomIdAndStatus(UUID roomId, AssignmentStatus status);

    List<StudentHousingAssignment> findByStatusAndReservedAtBefore(AssignmentStatus status, LocalDateTime dateTime);

    @Query("SELECT s FROM StudentHousingAssignment s WHERE s.application.applicationId = :applicationId AND s.status = :status")
    Optional<StudentHousingAssignment> findByApplication_ApplicationIdAndStatus(
            @Param("applicationId") UUID applicationId,
            @Param("status") AssignmentStatus status
    );

    @Query("SELECT a FROM StudentHousingAssignment a " +
            "JOIN FETCH a.student s " +
            "JOIN FETCH a.bed b " +
            "JOIN FETCH b.room r " +
            "JOIN FETCH r.floor f " +
            "JOIN FETCH f.building bd " +
            "WHERE s.cccd = :cccd AND a.status = :status")
    Optional<StudentHousingAssignment> findForCheckInByCccdAndStatus(
            @Param("cccd") String cccd,
            @Param("status") AssignmentStatus status
    );
}
