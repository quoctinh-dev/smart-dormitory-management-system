package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.student.dto.AdminProcessChangeRoomDto;
import com.sdms.backend.modules.student.dto.ChangeRoomResponseDto;
import com.sdms.backend.modules.student.dto.ChangeRoomSubmitDto;
import com.sdms.backend.modules.student.dto.MaintenanceRelocationDto;
import com.sdms.backend.modules.student.entity.ChangeRoomRequest;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.ChangeRoomRequestStatus;
import com.sdms.backend.modules.student.repository.ChangeRoomRequestRepository;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChangeRoomService {

    private final ChangeRoomRequestRepository changeRoomRequestRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final BedRepository bedRepository;

    /**
     * Sinh viên nộp đơn yêu cầu đổi phòng.
     */
    @Transactional
    public ChangeRoomResponseDto submitRequest(UUID studentId, ChangeRoomSubmitDto dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy sinh viên"));

        StudentHousingAssignment currentAssignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(studentId, AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên không có phòng hợp lệ để đổi"));

        if (changeRoomRequestRepository.existsByStudent_StudentIdAndStatus(studentId, ChangeRoomRequestStatus.PENDING)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Bạn đang có một yêu cầu đổi phòng chưa được xử lý");
        }

        ChangeRoomRequest request = new ChangeRoomRequest();
        request.setStudent(student);
        request.setCurrentAssignment(currentAssignment);
        request.setReason(dto.getReason());
        
        if (dto.getTargetRoomId() != null) {
            Room targetRoom = roomRepository.findById(dto.getTargetRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Phòng mục tiêu không tồn tại"));

            // Không cho phép nộp đơn sang phòng CLOSED hoặc MAINTENANCE
            if (targetRoom.getStatus() == com.sdms.backend.modules.room.enums.RoomStatus.CLOSED ||
                targetRoom.getStatus() == com.sdms.backend.modules.room.enums.RoomStatus.MAINTENANCE) {
                throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Phòng " + targetRoom.getRoomCode() + " hiện đang ở trạng thái " + targetRoom.getStatus() + ", không thể yêu cầu đổi vào phòng này");
            }

            // Validate Giới tính
            validateGenderMatch(student, targetRoom);

            request.setTargetRoom(targetRoom);
        }


        request.setStatus(ChangeRoomRequestStatus.PENDING);
        ChangeRoomRequest saved = changeRoomRequestRepository.save(request);

        return mapToDto(saved);
    }

    /**
     * Quản lý xét duyệt đơn xin đổi phòng của sinh viên.
     */
    @Transactional
    public ChangeRoomResponseDto processRequest(UUID adminId, Long requestId, AdminProcessChangeRoomDto dto) {
        ChangeRoomRequest request = changeRoomRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Yêu cầu không tồn tại"));

        if (request.getStatus() != ChangeRoomRequestStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Yêu cầu này đã được xử lý");
        }

        request.setAdminNote(dto.getAdminNote());
        request.setReviewedByUserId(adminId);

        if (dto.getIsApproved()) {
            if (dto.getNewBedId() == null) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Phải chỉ định giường mới (newBedId) khi duyệt đổi phòng");
            }

            Bed newBed = bedRepository.findById(dto.getNewBedId())
                    .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Giường không tồn tại"));

            // Validate trạng thái phòng đích: Không cho chuyển vào phòng CLOSED hoặc MAINTENANCE
            Room targetRoom = newBed.getRoom();
            if (targetRoom.getStatus() == RoomStatus.CLOSED || targetRoom.getStatus() == RoomStatus.MAINTENANCE) {
                throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Không thể chuyển sinh viên vào phòng " + targetRoom.getRoomCode() +
                    " vì phòng đang ở trạng thái " + targetRoom.getStatus());
            }

            if (assignmentRepository.existsByBed_BedIdAndStatusIn(newBed.getBedId(), List.of(AssignmentStatus.OCCUPIED, AssignmentStatus.RESERVED))) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Giường mới đã có người ở hoặc đã được đặt");
            }

            // Validate Giới tính trước khi duyệt chuyển phòng
            validateGenderMatch(request.getStudent(), newBed.getRoom());

            // Chuyển hợp đồng cũ sang trạng thái đã chuyển đi
            StudentHousingAssignment oldAssignment = request.getCurrentAssignment();
            oldAssignment.setStatus(AssignmentStatus.TRANSFERRED);
            oldAssignment.setCheckOutAt(LocalDateTime.now());
            assignmentRepository.saveAndFlush(oldAssignment);

            // Giải phóng giường cũ + giảm occupiedBeds phòng cũ
            Bed oldBed = oldAssignment.getBed();
            if (oldBed != null) {
                oldBed.setStatus(com.sdms.backend.modules.room.enums.BedStatus.AVAILABLE);
                bedRepository.save(oldBed);
                Room oldRoom = roomRepository.findById(oldBed.getRoom().getRoomId()).orElse(null);
                if (oldRoom != null) {
                    oldRoom.setOccupiedBeds(Math.max(0, oldRoom.getOccupiedBeds() - 1));
                    roomRepository.save(oldRoom);
                }
            }

            // Khởi tạo hợp đồng cho giường mới
            StudentHousingAssignment newAssignment = new StudentHousingAssignment();
            newAssignment.setApplication(oldAssignment.getApplication());
            newAssignment.setStudent(oldAssignment.getStudent());
            newAssignment.setBed(newBed);
            newAssignment.setStatus(AssignmentStatus.OCCUPIED);
            newAssignment.setReservedAt(LocalDateTime.now());
            newAssignment.setCheckInAt(LocalDateTime.now());
            newAssignment.setExpectedCheckOutAt(oldAssignment.getExpectedCheckOutAt());
            assignmentRepository.save(newAssignment);

            // Cập nhật trạng thái giường mới + tăng occupiedBeds phòng mới
            newBed.setStatus(com.sdms.backend.modules.room.enums.BedStatus.OCCUPIED);
            bedRepository.save(newBed);
            Room newRoom = roomRepository.findById(newBed.getRoom().getRoomId()).orElse(null);
            if (newRoom != null) {
                newRoom.setOccupiedBeds(newRoom.getOccupiedBeds() + 1);
                roomRepository.save(newRoom);
            }

            request.setStatus(ChangeRoomRequestStatus.APPROVED);
            
            // Đồng bộ dữ liệu truy cập thiết bị IoT
            eventPublisher.publishEvent(new com.sdms.backend.modules.student.event.StudentRoomChangedEvent(
                    this, oldAssignment.getStudent().getStudentId(), oldBed.getBedId(), newBed.getBedId()));
        } else {
            request.setStatus(ChangeRoomRequestStatus.REJECTED);
        }

        return mapToDto(changeRoomRequestRepository.save(request));
    }

    /**
     * Quản lý dời sinh viên sang phòng khác để tiến hành bảo trì phòng hiện tại.
     */
    @Transactional
    public void relocateStudentsForMaintenance(UUID adminId, MaintenanceRelocationDto dto) {
        Room maintenanceRoom = roomRepository.findById(dto.getMaintenanceRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy phòng bảo trì"));

        for (MaintenanceRelocationDto.StudentRelocation relocation : dto.getRelocations()) {
            StudentHousingAssignment currentAssignment = assignmentRepository
                    .findByStudent_StudentIdAndStatus(relocation.getStudentId(), AssignmentStatus.OCCUPIED)
                    .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên " + relocation.getStudentId() + " không ở trong phòng hợp lệ"));

            if (!currentAssignment.getBed().getRoom().getRoomId().equals(dto.getMaintenanceRoomId())) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên " + relocation.getStudentId() + " không thuộc phòng " + dto.getMaintenanceRoomId());
            }

            Bed targetBed = bedRepository.findById(relocation.getTargetBedId())
                    .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy giường đích"));

            // Validate trạng thái phòng đích: Không cho dời vào phòng CLOSED hoặc MAINTENANCE
            Room targetRoom = targetBed.getRoom();
            if (targetRoom.getStatus() == RoomStatus.CLOSED || targetRoom.getStatus() == RoomStatus.MAINTENANCE) {
                throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Không thể dời sinh viên vào phòng " + targetRoom.getRoomCode() +
                    " vì phòng đang ở trạng thái " + targetRoom.getStatus());
            }

            if (assignmentRepository.existsByBed_BedIdAndStatusIn(targetBed.getBedId(), List.of(AssignmentStatus.OCCUPIED, AssignmentStatus.RESERVED))) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Giường đích " + targetBed.getBedId() + " đã có người ở");
            }

            // Validate Giới tính trước khi ép dời phòng khẩn cấp
            validateGenderMatch(currentAssignment.getStudent(), targetBed.getRoom());

            // Chuyển hợp đồng cũ sang trạng thái đã chuyển đi
            currentAssignment.setStatus(AssignmentStatus.TRANSFERRED);
            currentAssignment.setCheckOutAt(LocalDateTime.now());
            assignmentRepository.saveAndFlush(currentAssignment);

            // Giải phóng giường cũ + giảm occupiedBeds phòng cũ
            Bed oldBed = currentAssignment.getBed();
            if (oldBed != null) {
                oldBed.setStatus(com.sdms.backend.modules.room.enums.BedStatus.AVAILABLE);
                bedRepository.save(oldBed);
                Room oldRoom = roomRepository.findById(oldBed.getRoom().getRoomId()).orElse(null);
                if (oldRoom != null) {
                    oldRoom.setOccupiedBeds(Math.max(0, oldRoom.getOccupiedBeds() - 1));
                    roomRepository.save(oldRoom);
                }
            }

            // Khởi tạo hợp đồng cho giường đích
            StudentHousingAssignment newAssignment = new StudentHousingAssignment();
            newAssignment.setApplication(currentAssignment.getApplication());
            newAssignment.setStudent(currentAssignment.getStudent());
            newAssignment.setBed(targetBed);
            newAssignment.setStatus(AssignmentStatus.OCCUPIED);
            newAssignment.setReservedAt(LocalDateTime.now());
            newAssignment.setCheckInAt(LocalDateTime.now());
            newAssignment.setExpectedCheckOutAt(currentAssignment.getExpectedCheckOutAt());
            assignmentRepository.save(newAssignment);

            // Cập nhật trạng thái giường đích + tăng occupiedBeds phòng đích
            targetBed.setStatus(com.sdms.backend.modules.room.enums.BedStatus.OCCUPIED);
            bedRepository.save(targetBed);
            Room newTargetRoom = roomRepository.findById(targetBed.getRoom().getRoomId()).orElse(null);
            if (newTargetRoom != null) {
                newTargetRoom.setOccupiedBeds(newTargetRoom.getOccupiedBeds() + 1);
                roomRepository.save(newTargetRoom);
            }
            
            // Đồng bộ dữ liệu truy cập thiết bị IoT
            eventPublisher.publishEvent(new com.sdms.backend.modules.student.event.StudentRoomChangedEvent(
                    this, currentAssignment.getStudent().getStudentId(), oldBed.getBedId(), targetBed.getBedId()));
        }

        // Cập nhật trạng thái phòng sang BẢO TRÌ khi toàn bộ sinh viên đã được dời
        long remaining = assignmentRepository.countByBed_Room_RoomIdAndStatusIn(
            dto.getMaintenanceRoomId(), 
            List.of(AssignmentStatus.OCCUPIED, AssignmentStatus.RESERVED, AssignmentStatus.PENDING_CHECKIN)
        );
        if (remaining == 0) {
            maintenanceRoom.setStatus(com.sdms.backend.modules.room.enums.RoomStatus.MAINTENANCE);
            roomRepository.save(maintenanceRoom);
        }
    }

    @Transactional(readOnly = true)
    public List<ChangeRoomResponseDto> getStudentRequests(org.springframework.security.core.Authentication authentication) {
        com.sdms.backend.modules.user.entity.UserAccount account = (com.sdms.backend.modules.user.entity.UserAccount) authentication.getPrincipal();
        if (account.getStudent() == null) {
            return java.util.Collections.emptyList();
        }
        return getStudentRequests(account.getStudent().getStudentId());
    }

    @Transactional(readOnly = true)
    public List<ChangeRoomResponseDto> getStudentRequests(UUID studentId) {
        return changeRoomRequestRepository.findByStudent_StudentId(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ChangeRoomResponseDto> getAllRequests(ChangeRoomRequestStatus status, Pageable pageable) {
        if (status != null) {
            return changeRoomRequestRepository.findByStatus(status, pageable).map(this::mapToDto);
        }
        return changeRoomRequestRepository.findAll(pageable).map(this::mapToDto);
    }

    private ChangeRoomResponseDto mapToDto(ChangeRoomRequest entity) {
        ChangeRoomResponseDto dto = new ChangeRoomResponseDto();
        dto.setId(entity.getId());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus());
        dto.setAdminNote(entity.getAdminNote());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getStudent() != null) {
            dto.setStudentCode(entity.getStudent().getStudentCode());
            dto.setStudentName(entity.getStudent().getFullName());
        }
        
        if (entity.getCurrentAssignment() != null && entity.getCurrentAssignment().getBed() != null) {
            dto.setCurrentRoomName(entity.getCurrentAssignment().getBed().getRoom().getRoomCode());
        }
        
        if (entity.getTargetRoom() != null) {
            dto.setTargetRoomName(entity.getTargetRoom().getRoomCode());
            dto.setTargetRoomId(entity.getTargetRoom().getRoomId());
        }
        return dto;
    }

    /**
     * Helper kiểm tra giới tính sinh viên so với cấu hình của Tầng/Tòa.
     * Chặn các trường hợp xếp nhầm Nam vào Tòa/Tầng Nữ và ngược lại.
     */
    private void validateGenderMatch(Student student, Room targetRoom) {
        if (student == null || student.getSourceApplication() == null || student.getSourceApplication().getGender() == null) return;
        
        com.sdms.backend.common.enums.Gender studentGender = student.getSourceApplication().getGender();
        com.sdms.backend.modules.room.entity.Floor floor = targetRoom.getFloor();
        com.sdms.backend.modules.room.entity.Building building = floor.getBuilding();

        // 1. Check Building
        if (building.getGender() != com.sdms.backend.modules.room.enums.BuildingGender.MIXED) {
            if (!building.getGender().name().equals(studentGender.name())) {
                String genderStr = studentGender == com.sdms.backend.common.enums.Gender.MALE ? "Nam" : "Nữ";
                String buildingGenderStr = building.getGender() == com.sdms.backend.modules.room.enums.BuildingGender.MALE ? "Nam" : "Nữ";
                throw new AppException(ErrorCode.VALIDATION_FAILED, 
                    String.format("Không thể chuyển sinh viên %s sang Tòa %s (Tòa dành riêng cho %s)", 
                        genderStr, building.getCode(), buildingGenderStr));
            }
        }

        // 2. Check Floor (Tầng)
        if (floor.getGender() != null) {
            if (floor.getGender() != studentGender) {
                String genderStr = studentGender == com.sdms.backend.common.enums.Gender.MALE ? "Nam" : "Nữ";
                String floorGenderStr = floor.getGender() == com.sdms.backend.common.enums.Gender.MALE ? "Nam" : "Nữ";
                throw new AppException(ErrorCode.VALIDATION_FAILED, 
                    String.format("Không thể chuyển sinh viên %s sang Tầng %s (Tầng dành riêng cho %s)", 
                        genderStr, floor.getFloorNumber(), floorGenderStr));
            }
        }
    }
}
