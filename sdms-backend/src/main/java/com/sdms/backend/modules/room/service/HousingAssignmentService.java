package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.room.entity.*;
import com.sdms.backend.modules.room.enums.*;
import com.sdms.backend.modules.room.repository.*;
import com.sdms.backend.modules.room.validator.AssignmentValidator;
import com.sdms.backend.modules.room.event.CheckInCompletedEvent;
import com.sdms.backend.modules.room.event.HousingReservationExpiredEvent;
import com.sdms.backend.modules.room.event.AssignmentCancelledEvent;
import com.sdms.backend.modules.room.event.BedReleasedEvent;
import com.sdms.backend.modules.student.entity.Student;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class HousingAssignmentService {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final AssignmentValidator assignmentValidator;
    private final ApplicationEventPublisher eventPublisher;
    private final EntityManager entityManager;

    private void validateApplicationCanAssign(UUID applicationId) {
        boolean exists = assignmentRepository.existsByApplication_ApplicationIdAndStatusIn(
                applicationId,
                List.of(AssignmentStatus.RESERVED, AssignmentStatus.PENDING_CHECKIN, AssignmentStatus.OCCUPIED)
        );
        if (exists) {
            throw new AppException("Application already has an active housing assignment", HttpStatus.BAD_REQUEST);
        }
    }

    public StudentHousingAssignment reserveBed(UUID applicationId, Gender gender) {
        validateApplicationCanAssign(applicationId);

        com.sdms.backend.modules.room.enums.BuildingGender buildingGender = 
            (gender == Gender.MALE) ? com.sdms.backend.modules.room.enums.BuildingGender.MALE 
                                    : com.sdms.backend.modules.room.enums.BuildingGender.FEMALE;

        List<Room> rooms = roomRepository.findAvailableRoomsByGender(gender, buildingGender, RoomStatus.AVAILABLE);

        for (Room room : rooms) {
            Room lockedRoom = roomRepository.findByIdForUpdate(room.getRoomId())
                    .orElseThrow(() -> new AppException("Room not found for update", HttpStatus.NOT_FOUND));

            List<Bed> beds = bedRepository.findAvailableBeds(lockedRoom.getRoomId(), BedStatus.AVAILABLE);
            if (!beds.isEmpty()) {
                return reserveBedInternal(applicationId, lockedRoom, beds.get(0));
            }
        }
        throw new AppException("No available rooms for the current policy", HttpStatus.CONFLICT);
    }

    private StudentHousingAssignment reserveBedInternal(UUID applicationId, Room lockedRoom, Bed bed) {
        bed.setStatus(BedStatus.RESERVED);
        bedRepository.save(bed);

        lockedRoom.setOccupiedBeds(lockedRoom.getOccupiedBeds() + 1);
        recalculateRoomStatus(lockedRoom);

        StudentHousingAssignment assignment = new StudentHousingAssignment();
        DormitoryApplication application = entityManager.getReference(DormitoryApplication.class, applicationId);
        assignment.setApplication(application);
        assignment.setBed(bed);
        assignment.setStatus(AssignmentStatus.RESERVED);
        assignment.setReservedAt(LocalDateTime.now());

        return assignmentRepository.save(assignment);
    }

    public void linkStudentToAssignment(UUID assignmentId, Student student) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateLinkStudent(assignment);
        assignmentValidator.validateStudentHasNoActiveAssignment(student.getStudentId());
        assignment.setStudent(student);
        assignmentRepository.save(assignment);
    }

    public void checkIn(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateCheckIn(assignment);

        assignment.setStatus(AssignmentStatus.OCCUPIED);
        assignment.setCheckInAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        Bed bed = assignment.getBed();
        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);

        recalculateRoomStatus(bed.getRoom());

        eventPublisher.publishEvent(new CheckInCompletedEvent(this, assignment.getAssignmentId(), assignment.getApplication().getApplicationId(),
                assignment.getStudent() != null ? assignment.getStudent().getStudentId() : null,
                assignment.getStudent() != null ? assignment.getStudent().getEmail() : null,
                assignment.getStudent() != null ? assignment.getStudent().getFullName() : null,
                assignment.getBed().getBedCode(),
                assignment.getBed().getRoom().getRoomCode()));
        log.info("Student checked in successfully for assignment {}. Published CheckInCompletedEvent.", assignmentId);
    }

    public void confirmReserved(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignment.setStatus(AssignmentStatus.PENDING_CHECKIN);
        assignmentRepository.save(assignment);
        log.info("Assignment {} status updated to PENDING_CHECKIN upon payment success", assignmentId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expireReservation(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateReservationExpired(assignment);
        releaseResources(assignment);
        assignment.setStatus(AssignmentStatus.EXPIRED);
        assignmentRepository.save(assignment);

        eventPublisher.publishEvent(new HousingReservationExpiredEvent(this, assignment.getApplication().getApplicationId(), assignmentId));
        eventPublisher.publishEvent(new AssignmentCancelledEvent(this, assignmentId, "EXPIRED"));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void cancelReservation(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        releaseResources(assignment);
        assignment.setStatus(AssignmentStatus.CANCELLED);
        assignmentRepository.save(assignment);

        eventPublisher.publishEvent(new AssignmentCancelledEvent(this, assignmentId, "CANCELLED"));
    }

    public void checkOut(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateCheckOut(assignment);
        releaseResources(assignment);
        assignment.setStatus(AssignmentStatus.CHECKED_OUT);
        assignment.setCheckOutAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }

    public void recalculateRoomStatus(Room room) {
        if (room.getStatus() == RoomStatus.MAINTENANCE || room.getStatus() == RoomStatus.CLOSED) {
            return;
        }

        if (room.getOccupiedBeds() >= room.getCapacity()) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(RoomStatus.AVAILABLE);
        }

        roomRepository.save(room);
    }

    private void releaseResources(StudentHousingAssignment assignment) {
        Bed bed = assignment.getBed();
        bed.setStatus(BedStatus.AVAILABLE);
        bedRepository.save(bed);

        Room lockedRoom = roomRepository.findByIdForUpdate(bed.getRoom().getRoomId())
                .orElseThrow(() -> new AppException("Room not found for update", HttpStatus.NOT_FOUND));
        lockedRoom.setOccupiedBeds(Math.max(0, lockedRoom.getOccupiedBeds() - 1));

        recalculateRoomStatus(lockedRoom);

        eventPublisher.publishEvent(new BedReleasedEvent(this, lockedRoom.getRoomId(), bed.getBedId(), assignment.getApplication().getGender(), assignment.getAssignmentId(), assignment.getStudent() != null ? assignment.getStudent().getStudentId() : null));
    }

    private StudentHousingAssignment findAssignment(UUID assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException("Assignment not found", HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public StudentHousingAssignment getAssignmentById(UUID assignmentId) {
        return findAssignment(assignmentId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void reconcileRoomOccupancy(UUID roomId) {
        Room lockedRoom = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new AppException("Room not found for reconciliation", HttpStatus.NOT_FOUND));

        List<Bed> beds = bedRepository.findByRoom_RoomId(roomId);

        for (Bed bed : beds) {
            Optional<StudentHousingAssignment> activeAssignmentOpt = Optional.empty();
            try {
                activeAssignmentOpt = assignmentRepository.findByBed_BedIdAndStatusIn(
                        bed.getBedId(),
                        List.of(AssignmentStatus.RESERVED, AssignmentStatus.PENDING_CHECKIN, AssignmentStatus.OCCUPIED)
                );
            } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | jakarta.persistence.NonUniqueResultException e) {
                log.error("[ROOM_RECONCILIATION] [CRITICAL_DATA_CORRUPTION] Critical integrity violation: Bed code {} in room {} has multiple active assignments! Human intervention required.",
                        bed.getBedCode(), lockedRoom.getRoomCode(), e);
                throw new AppException("Critical data corruption: Bed has multiple active assignments", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            StudentHousingAssignment activeAssignment = activeAssignmentOpt.orElse(null);

            if (activeAssignment == null) {
                if (bed.getStatus() != BedStatus.AVAILABLE) {
                    log.warn("[ROOM_RECONCILIATION] [BED_STATE_FIXED] Bed code {} in room {} was {} but had no active assignment. Fixed to AVAILABLE.",
                            bed.getBedCode(), lockedRoom.getRoomCode(), bed.getStatus());
                    bed.setStatus(BedStatus.AVAILABLE);
                    bedRepository.save(bed);
                }
            } else {
                if (activeAssignment.getStatus() == AssignmentStatus.OCCUPIED) {
                    if (bed.getStatus() != BedStatus.OCCUPIED) {
                        log.warn("[ROOM_RECONCILIATION] [BED_STATE_FIXED] Bed code {} in room {} was {} but active assignment was OCCUPIED. Fixed to OCCUPIED.",
                                  bed.getBedCode(), lockedRoom.getRoomCode(), bed.getStatus());
                        bed.setStatus(BedStatus.OCCUPIED);
                        bedRepository.save(bed);
                    }
                } else if (activeAssignment.getStatus() == AssignmentStatus.RESERVED) {
                    if (bed.getStatus() != BedStatus.RESERVED) {
                        log.warn("[ROOM_RECONCILIATION] [BED_STATE_FIXED] Bed code {} in room {} was {} but active assignment was RESERVED. Fixed to RESERVED.",
                                bed.getBedCode(), lockedRoom.getRoomCode(), bed.getStatus());
                        bed.setStatus(BedStatus.RESERVED);
                        bedRepository.save(bed);
                    }
                }
            }
        }

        long actualOccupiedBeds = assignmentRepository.countByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.RESERVED)
                + assignmentRepository.countByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.PENDING_CHECKIN)
                + assignmentRepository.countByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.OCCUPIED);

        if (lockedRoom.getOccupiedBeds() != (int) actualOccupiedBeds) {
            log.warn("[ROOM_RECONCILIATION] [ROOM_OCCUPANCY_FIXED] Room code {} occupied beds count was {} but corrected to actual {}.",
                    lockedRoom.getRoomCode(), lockedRoom.getOccupiedBeds(), actualOccupiedBeds);
            lockedRoom.setOccupiedBeds((int) actualOccupiedBeds);
        }

        recalculateRoomStatus(lockedRoom);
        roomRepository.save(lockedRoom);
    }
}
