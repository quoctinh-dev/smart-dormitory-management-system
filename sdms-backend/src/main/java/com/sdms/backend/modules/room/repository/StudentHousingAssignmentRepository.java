package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from StudentHousingAssignment a where a.assignmentId = :id")
    Optional<StudentHousingAssignment> findByIdForUpdate(@Param("id") UUID id);
    
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

    long countByBed_Room_RoomIdAndStatusIn(UUID roomId, Collection<AssignmentStatus> statuses);

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

    @Query("SELECT a FROM StudentHousingAssignment a " +
            "JOIN FETCH a.student s " +
            "JOIN FETCH a.bed b " +
            "JOIN FETCH b.room r " +
            "JOIN FETCH r.floor f " +
            "JOIN FETCH f.building bd " +
            "WHERE s.rfidCode = :rfidCode AND a.status = :status")
    Optional<StudentHousingAssignment> findByStudentRfidAndStatusOptimized(
            @Param("rfidCode") String rfidCode,
            @Param("status") AssignmentStatus status
    );

    @Query("SELECT a FROM StudentHousingAssignment a " +
            "JOIN FETCH a.student s " +
            "JOIN FETCH a.bed b " +
            "JOIN FETCH b.room r " +
            "JOIN FETCH r.floor f " +
            "JOIN FETCH f.building bd " +
            "WHERE s.studentId = :studentId AND a.status = :status")
    Optional<StudentHousingAssignment> findByStudentIdAndStatusOptimized(
            @Param("studentId") UUID studentId,
            @Param("status") AssignmentStatus status
    );

    @Query(value = "SELECT a FROM StudentHousingAssignment a " +
            "JOIN FETCH a.student s " +
            "JOIN FETCH a.bed b " +
            "JOIN FETCH b.room r " +
            "JOIN FETCH r.floor f " +
            "JOIN FETCH f.building bd " +
            "WHERE (coalesce(:statuses, NULL) IS NULL OR a.status IN :statuses) " +
            "AND (:keyword IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR s.studentCode LIKE CONCAT('%', :keyword, '%'))",
            countQuery = "SELECT COUNT(a) FROM StudentHousingAssignment a " +
                    "JOIN a.student s " +
                    "WHERE (coalesce(:statuses, NULL) IS NULL OR a.status IN :statuses) " +
                    "AND (:keyword IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR s.studentCode LIKE CONCAT('%', :keyword, '%'))")
    org.springframework.data.domain.Page<StudentHousingAssignment> searchForAudit(
            @Param("statuses") java.util.List<AssignmentStatus> statuses,
            @Param("keyword") String keyword,
            org.springframework.data.domain.Pageable pageable
    );
    /**
     * Xác thực mã PIN cửa phòng.
     * Logic: PIN thuộc về PHÒNG (r.roomPinCode), không phải sinh viên.
     * SV đổi phòng → tự động dùng PIN của phòng mới (không cần migration).
     * Query: Tìm assignment OCCUPIED của sinh viên ở đúng phòng có Gate đó và PIN đúng.
     */
    @Query("SELECT a FROM StudentHousingAssignment a " +
            "JOIN FETCH a.student s " +
            "JOIN FETCH a.bed b " +
            "JOIN FETCH b.room r " +
            "JOIN FETCH r.floor f " +
            "JOIN FETCH f.building bd " +
            "WHERE r.roomPinCode = :pinCode " +
            "AND a.status = :status " +
            "AND r.roomId = (SELECT g.room.roomId FROM com.sdms.backend.modules.smartaccess.domain.entity.Gate g WHERE g.gateId = :gateId AND g.isActive = true)")
    List<StudentHousingAssignment> findByPinCodeAndGateIdAndStatus(
            @Param("pinCode") String pinCode,
            @Param("gateId") UUID gateId,
            @Param("status") AssignmentStatus status
    );

    @Query("SELECT bd.buildingId, s.rfidCode FROM StudentHousingAssignment a " +
           "JOIN a.student s " +
           "JOIN a.bed b " +
           "JOIN b.room r " +
           "JOIN r.floor f " +
           "JOIN f.building bd " +
           "WHERE a.status = :status AND s.rfidCode IS NOT NULL")
    List<Object[]> findActiveRfidsGroupedByBuilding(@Param("status") AssignmentStatus status);
}
