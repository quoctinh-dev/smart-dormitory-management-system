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

/**
 * Service trung tâm quản lý luồng sống của Assignment (Housing Assignment Core Engine).
 * Tích hợp cơ chế bảo vệ trạng thái an toàn dựa trên Database State thực tế (ROOM-04 STEP 03).
 */
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

    /**
     * 1. Validate: Kiểm tra tính duy nhất trên ApplicationId (chặn gán trùng hồ sơ).
     */
    private void validateApplicationCanAssign(UUID applicationId) {
        boolean exists = assignmentRepository.existsByApplication_ApplicationIdAndStatusIn(
                applicationId,
                List.of(AssignmentStatus.RESERVED, AssignmentStatus.PENDING_CHECKIN, AssignmentStatus.OCCUPIED)
        );
        if (exists) {
            throw new AppException("Application already has an active housing assignment", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * 2. Reserve Bed: Phân bổ chỗ ở tự động dựa theo chính sách giới tính.
     */
    public StudentHousingAssignment reserveBed(UUID applicationId, Gender gender) {
        validateApplicationCanAssign(applicationId);

        OccupancyPolicy policy = (gender == Gender.MALE)
                ? OccupancyPolicy.MALE : OccupancyPolicy.FEMALE;

        List<Room> rooms = roomRepository.findAvailableRoomsByPolicy(policy, RoomStatus.AVAILABLE);

        for (Room room : rooms) {
            // Task 01: Khóa bi quan thực thể Room TRƯỚC để thống nhất thứ tự khóa (Room -> Bed) chống Deadlock
            Room lockedRoom = roomRepository.findByIdForUpdate(room.getRoomId())
                    .orElseThrow(() -> new AppException("Room not found for update", HttpStatus.NOT_FOUND));

            // Sau khi khóa Room, mới truy vấn tìm giường trống của phòng đó
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
        recalculateRoomStatus(lockedRoom); // STEP 03.5: Tính toán trạng thái phòng tự động hóa an toàn

        StudentHousingAssignment assignment = new StudentHousingAssignment();
        // Load proxy reference of DormitoryApplication without querying database or locking external entity
        DormitoryApplication application = entityManager.getReference(DormitoryApplication.class, applicationId);
        assignment.setApplication(application);
        assignment.setBed(bed);
        assignment.setStatus(AssignmentStatus.RESERVED);
        assignment.setReservedAt(LocalDateTime.now());

        return assignmentRepository.save(assignment);
    }

    /**
     * 3. Link Student: Gọi sau khi Payment thành công và Student được khởi tạo trên hệ thống.
     */
    public void linkStudentToAssignment(UUID assignmentId, Student student) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateLinkStudent(assignment);
        assignmentValidator.validateStudentHasNoActiveAssignment(student.getStudentId());
        assignment.setStudent(student);
        assignmentRepository.save(assignment);
    }

    /**
     * 4. Check In: Chuyển trạng thái sang OCCUPIED, cập nhật phần cứng IoT.
     */
    public void checkIn(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateCheckIn(assignment);
        assignment.setStatus(AssignmentStatus.OCCUPIED);
        assignment.setCheckInAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        Bed bed = assignment.getBed();
        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);

        // Tái xác thực lại phòng để chắc chắn đồng bộ trạng thái thực tế
        recalculateRoomStatus(bed.getRoom());

        // Phát sự kiện Check-in hoàn tất để Student Module cập nhật trạng thái Student thành ACTIVE
        if (assignment.getStudent() != null) {
            eventPublisher.publishEvent(new CheckInCompletedEvent(this, assignment.getStudent().getStudentId(), assignmentId));
        }
    }

    /**
     * 5. Expire Reservation: Giải phóng tài nguyên giường nếu sinh viên quá hạn thanh toán.
     * Chạy trong Transaction độc lập (Propagation.REQUIRES_NEW) để cách ly lỗi giữa các bản ghi.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expireReservation(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateReservationExpired(assignment);
        releaseResources(assignment);
        assignment.setStatus(AssignmentStatus.EXPIRED);
        assignmentRepository.save(assignment);

        // Phát sự kiện hết hạn giữ chỗ (để Application Module tự xử lý chuyển đổi trạng thái sang EXPIRED)
        eventPublisher.publishEvent(new HousingReservationExpiredEvent(this, assignment.getApplication().getApplicationId(), assignmentId));
    }

    /**
     * 6. Check Out: Kết thúc quá trình cư trú của sinh viên, dọn dẹp bộ nhớ đệm AI/IoT cửa từ.
     */
    public void checkOut(UUID assignmentId) {
        StudentHousingAssignment assignment = findAssignment(assignmentId);
        assignmentValidator.validateCheckOut(assignment);
        releaseResources(assignment);
        assignment.setStatus(AssignmentStatus.CHECKED_OUT);
        assignment.setCheckOutAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }

    /**
     * STEP 03.5 ADD: Helper tự động tính toán lại và cập nhật trạng thái phòng (AVAILABLE <-> FULL)
     * dựa vào số liệu biến động thực tế sau các hành vi Check-In, Check-Out hoặc hủy phòng.
     * Chú ý quan trọng: Tuyệt đối không ghi đè trạng thái lên các phòng đang bảo trì kỹ thuật (MAINTENANCE) hoặc đã đóng (CLOSED).
     */
    public void recalculateRoomStatus(Room room) {
        // Bảo vệ an toàn hạ tầng: Tránh ghi đè lên các trạng thái đặc biệt do Admin thiết lập thủ công
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

    /**
     * Helper: Giải phóng Bed vật lý & cập nhật đếm số lượng an toàn.
     */
    private void releaseResources(StudentHousingAssignment assignment) {
        Bed bed = assignment.getBed();
        bed.setStatus(BedStatus.AVAILABLE);
        bedRepository.save(bed);

        // Khóa bi quan thực thể Room để ngăn chặn Lost Update khi giải phóng occupiedBeds
        Room lockedRoom = roomRepository.findByIdForUpdate(bed.getRoom().getRoomId())
                .orElseThrow(() -> new AppException("Room not found for update", HttpStatus.NOT_FOUND));
        lockedRoom.setOccupiedBeds(Math.max(0, lockedRoom.getOccupiedBeds() - 1));

        // Gọi hàm tái cấu trúc trạng thái thông minh thay vì gán cứng trạng thái thô như phiên bản cũ
        recalculateRoomStatus(lockedRoom);

        // Phát sự kiện giải phóng giường
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

    /**
     * Nghiệp vụ đối soát và tự động phục hồi dữ liệu (Self-Healing) cho từng phòng.
     * Chạy dưới Transaction độc lập (Propagation.REQUIRES_NEW) để cách ly lỗi và tránh giữ khóa lâu.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void reconcileRoomOccupancy(UUID roomId) {
        // STEP 1: Khóa bi quan Room
        Room lockedRoom = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new AppException("Room not found for reconciliation", HttpStatus.NOT_FOUND));

        // STEP 2: Load toàn bộ Bed của Room
        List<Bed> beds = bedRepository.findByRoom_RoomId(roomId);

        // STEP 3: Đối soát từng Bed dựa theo Source of Truth = StudentHousingAssignment
        for (Bed bed : beds) {
            Optional<StudentHousingAssignment> activeAssignmentOpt = Optional.empty();
            try {
                activeAssignmentOpt = assignmentRepository.findByBed_BedIdAndStatusIn(
                        bed.getBedId(),
                        List.of(AssignmentStatus.RESERVED, AssignmentStatus.PENDING_CHECKIN, AssignmentStatus.OCCUPIED)
                );
            } catch (org.springframework.dao.IncorrectResultSizeDataAccessException | jakarta.persistence.NonUniqueResultException e) {
                // DATA CORRUPTION CASE: 1 Bed có nhiều Active Assignment
                log.error("[ROOM_RECONCILIATION] [CRITICAL_DATA_CORRUPTION] Critical integrity violation: Bed code {} in room {} has multiple active assignments! Human intervention required.",
                        bed.getBedCode(), lockedRoom.getRoomCode(), e);
                // Throw exception để rollback transaction của Room hiện tại
                throw new AppException("Critical data corruption: Bed has multiple active assignments", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            StudentHousingAssignment activeAssignment = activeAssignmentOpt.orElse(null);

            // Bắt đầu đối soát trạng thái Bed
            if (activeAssignment == null) {
                // CASE A & CASE F: Assignment = NULL nhưng Bed không phải AVAILABLE
                if (bed.getStatus() != BedStatus.AVAILABLE) {
                    log.warn("[ROOM_RECONCILIATION] [BED_STATE_FIXED] Bed code {} in room {} was {} but had no active assignment. Fixed to AVAILABLE.",
                            bed.getBedCode(), lockedRoom.getRoomCode(), bed.getStatus());
                    bed.setStatus(BedStatus.AVAILABLE);
                    bedRepository.save(bed);
                }
            } else {
                if (activeAssignment.getStatus() == AssignmentStatus.OCCUPIED) {
                    // CASE B & CASE C: Assignment = OCCUPIED nhưng Bed không phải OCCUPIED
                    if (bed.getStatus() != BedStatus.OCCUPIED) {
                        log.warn("[ROOM_RECONCILIATION] [BED_STATE_FIXED] Bed code {} in room {} was {} but active assignment was OCCUPIED. Fixed to OCCUPIED.",
                                  bed.getBedCode(), lockedRoom.getRoomCode(), bed.getStatus());
                        bed.setStatus(BedStatus.OCCUPIED);
                        bedRepository.save(bed);
                    }
                } else if (activeAssignment.getStatus() == AssignmentStatus.RESERVED) {
                    // CASE D & CASE E: Assignment = RESERVED nhưng Bed không phải RESERVED
                    if (bed.getStatus() != BedStatus.RESERVED) {
                        log.warn("[ROOM_RECONCILIATION] [BED_STATE_FIXED] Bed code {} in room {} was {} but active assignment was RESERVED. Fixed to RESERVED.",
                                bed.getBedCode(), lockedRoom.getRoomCode(), bed.getStatus());
                        bed.setStatus(BedStatus.RESERVED);
                        bedRepository.save(bed);
                    }
                }
            }
        }

        // STEP 4: Tính lại occupiedBeds thực tế
        long actualOccupiedBeds = assignmentRepository.countByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.RESERVED)
                + assignmentRepository.countByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.PENDING_CHECKIN)
                + assignmentRepository.countByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.OCCUPIED);

        if (lockedRoom.getOccupiedBeds() != (int) actualOccupiedBeds) {
            log.warn("[ROOM_RECONCILIATION] [ROOM_OCCUPANCY_FIXED] Room code {} occupied beds count was {} but corrected to actual {}.",
                    lockedRoom.getRoomCode(), lockedRoom.getOccupiedBeds(), actualOccupiedBeds);
            lockedRoom.setOccupiedBeds((int) actualOccupiedBeds);
        }

        // STEP 5: recalculate Room Status và lưu Room
        recalculateRoomStatus(lockedRoom);
        roomRepository.save(lockedRoom);
    }
}