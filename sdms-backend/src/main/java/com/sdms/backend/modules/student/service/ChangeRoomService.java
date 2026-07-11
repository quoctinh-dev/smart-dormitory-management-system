package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
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
import org.springframework.http.HttpStatus;
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
    private final BedRepository bedRepository;

    @Transactional
    public ChangeRoomResponseDto submitRequest(UUID studentId, ChangeRoomSubmitDto dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException("Không tìm thấy sinh viên", HttpStatus.NOT_FOUND));

        // Lấy assignment hiện tại (đang ở)
        StudentHousingAssignment currentAssignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(studentId, AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException("Sinh viên không có phòng hợp lệ để đổi", HttpStatus.BAD_REQUEST));

        // Kiểm tra xem có đơn nào đang chờ duyệt không
        if (changeRoomRequestRepository.existsByStudent_StudentIdAndStatus(studentId, ChangeRoomRequestStatus.PENDING)) {
            throw new AppException("Bạn đang có một yêu cầu đổi phòng chưa được xử lý", HttpStatus.BAD_REQUEST);
        }

        ChangeRoomRequest request = new ChangeRoomRequest();
        request.setStudent(student);
        request.setCurrentAssignment(currentAssignment);
        request.setReason(dto.getReason());
        
        if (dto.getTargetRoomId() != null) {
            Room targetRoom = roomRepository.findById(dto.getTargetRoomId())
                    .orElseThrow(() -> new AppException("Phòng mục tiêu không tồn tại", HttpStatus.NOT_FOUND));
            request.setTargetRoom(targetRoom);
        }

        request.setStatus(ChangeRoomRequestStatus.PENDING);
        ChangeRoomRequest saved = changeRoomRequestRepository.save(request);

        return mapToDto(saved);
    }

    @Transactional
    public ChangeRoomResponseDto processRequest(UUID adminId, Long requestId, AdminProcessChangeRoomDto dto) {
        ChangeRoomRequest request = changeRoomRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException("Yêu cầu không tồn tại", HttpStatus.NOT_FOUND));

        if (request.getStatus() != ChangeRoomRequestStatus.PENDING) {
            throw new AppException("Yêu cầu này đã được xử lý", HttpStatus.BAD_REQUEST);
        }

        request.setAdminNote(dto.getAdminNote());
        request.setReviewedByUserId(adminId);

        if (dto.getIsApproved()) {
            if (dto.getNewBedId() == null) {
                throw new AppException("Phải chỉ định giường mới (newBedId) khi duyệt đổi phòng", HttpStatus.BAD_REQUEST);
            }

            Bed newBed = bedRepository.findById(dto.getNewBedId())
                    .orElseThrow(() -> new AppException("Giường không tồn tại", HttpStatus.NOT_FOUND));

            if (assignmentRepository.existsByBed_BedIdAndStatusIn(newBed.getBedId(), List.of(AssignmentStatus.OCCUPIED, AssignmentStatus.RESERVED))) {
                throw new AppException("Giường mới đã có người ở hoặc đã được đặt", HttpStatus.BAD_REQUEST);
            }

            // Đóng assignment cũ (TRANSFERRED)
            StudentHousingAssignment oldAssignment = request.getCurrentAssignment();
            oldAssignment.setStatus(AssignmentStatus.TRANSFERRED);
            oldAssignment.setCheckOutAt(LocalDateTime.now());
            assignmentRepository.save(oldAssignment);

            // Tạo assignment mới (OCCUPIED)
            StudentHousingAssignment newAssignment = new StudentHousingAssignment();
            newAssignment.setApplication(oldAssignment.getApplication());
            newAssignment.setStudent(oldAssignment.getStudent());
            newAssignment.setBed(newBed);
            newAssignment.setStatus(AssignmentStatus.OCCUPIED);
            newAssignment.setReservedAt(LocalDateTime.now());
            newAssignment.setCheckInAt(LocalDateTime.now());
            newAssignment.setExpectedCheckOutAt(oldAssignment.getExpectedCheckOutAt());
            assignmentRepository.save(newAssignment);

            request.setStatus(ChangeRoomRequestStatus.APPROVED);
        } else {
            request.setStatus(ChangeRoomRequestStatus.REJECTED);
        }

        return mapToDto(changeRoomRequestRepository.save(request));
    }

    @Transactional
    public void relocateStudentsForMaintenance(UUID adminId, MaintenanceRelocationDto dto) {
        Room maintenanceRoom = roomRepository.findById(dto.getMaintenanceRoomId())
                .orElseThrow(() -> new AppException("Không tìm thấy phòng bảo trì", HttpStatus.NOT_FOUND));

        // Kiểm tra xem phòng có đang bảo trì không
        if (maintenanceRoom.getStatus() != com.sdms.backend.modules.room.enums.RoomStatus.MAINTENANCE) {
            // Có thể tự update thành MAINTENANCE luôn nếu business rule cho phép, ở đây ta throw exception
            throw new AppException("Phòng chưa được đặt trạng thái BẢO TRÌ", HttpStatus.BAD_REQUEST);
        }

        for (MaintenanceRelocationDto.StudentRelocation relocation : dto.getRelocations()) {
            StudentHousingAssignment currentAssignment = assignmentRepository
                    .findByStudent_StudentIdAndStatus(relocation.getStudentId(), AssignmentStatus.OCCUPIED)
                    .orElseThrow(() -> new AppException("Sinh viên " + relocation.getStudentId() + " không ở trong phòng hợp lệ", HttpStatus.BAD_REQUEST));

            if (!currentAssignment.getBed().getRoom().getRoomId().equals(dto.getMaintenanceRoomId())) {
                throw new AppException("Sinh viên " + relocation.getStudentId() + " không thuộc phòng " + dto.getMaintenanceRoomId(), HttpStatus.BAD_REQUEST);
            }

            Bed targetBed = bedRepository.findById(relocation.getTargetBedId())
                    .orElseThrow(() -> new AppException("Không tìm thấy giường đích", HttpStatus.NOT_FOUND));

            if (assignmentRepository.existsByBed_BedIdAndStatusIn(targetBed.getBedId(), List.of(AssignmentStatus.OCCUPIED, AssignmentStatus.RESERVED))) {
                throw new AppException("Giường đích " + targetBed.getBedId() + " đã có người ở", HttpStatus.BAD_REQUEST);
            }

            // Đóng assignment cũ (TRANSFERRED)
            currentAssignment.setStatus(AssignmentStatus.TRANSFERRED);
            currentAssignment.setCheckOutAt(LocalDateTime.now());
            assignmentRepository.save(currentAssignment);

            // Tạo assignment mới (OCCUPIED)
            StudentHousingAssignment newAssignment = new StudentHousingAssignment();
            newAssignment.setApplication(currentAssignment.getApplication());
            newAssignment.setStudent(currentAssignment.getStudent());
            newAssignment.setBed(targetBed);
            newAssignment.setStatus(AssignmentStatus.OCCUPIED);
            newAssignment.setReservedAt(LocalDateTime.now());
            newAssignment.setCheckInAt(LocalDateTime.now());
            newAssignment.setExpectedCheckOutAt(currentAssignment.getExpectedCheckOutAt());
            assignmentRepository.save(newAssignment);
        }
    }

    public List<ChangeRoomResponseDto> getStudentRequests(UUID studentId) {
        return changeRoomRequestRepository.findByStudent_StudentId(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

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
        
        if (entity.getCurrentAssignment() != null && entity.getCurrentAssignment().getBed() != null) {
            dto.setCurrentRoomName(entity.getCurrentAssignment().getBed().getRoom().getRoomCode());
        }
        
        if (entity.getTargetRoom() != null) {
            dto.setTargetRoomName(entity.getTargetRoom().getRoomCode());
        }
        return dto;
    }
}
