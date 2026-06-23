package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.dto.request.CreateBedRequest;
import com.sdms.backend.modules.room.dto.request.UpdateBedRequest;
import com.sdms.backend.modules.room.dto.response.BedResponse;
import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.mapper.BedMapper;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.validator.BedValidator;
import com.sdms.backend.modules.room.validator.RoomValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BedService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;
    private final BedMapper bedMapper;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final BedValidator bedValidator;
    private final RoomValidator roomValidator;

    public BedResponse createBed(CreateBedRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException("Room not found", HttpStatus.NOT_FOUND));

        roomValidator.validateCanGenerateBeds(room, 1);

        String normalizedCode = request.getBedCode().trim().toUpperCase();
        if (bedRepository.existsByRoom_RoomIdAndBedCode(room.getRoomId(), normalizedCode)) {
            throw new AppException("Bed code already exists in this room", HttpStatus.BAD_REQUEST);
        }

        Bed bed = new Bed();
        bed.setRoom(room);
        bed.setBedCode(normalizedCode);
        bed.setStatus(BedStatus.AVAILABLE);
        bed.setNote(request.getNote());

        return bedMapper.toResponse(bedRepository.save(bed));
    }

    public BedResponse updateBed(UUID bedId, UpdateBedRequest request) {
        Bed bed = findById(bedId);

        if (request.getNote() != null) {
            bed.setNote(request.getNote());
        }

        if (request.getStatus() != null) {
            changeStatus(bedId, request.getStatus());
        }

        return bedMapper.toResponse(bedRepository.save(bed));
    }

    public void changeStatus(UUID bedId, BedStatus status) {
        Bed bed = findById(bedId);

        // Validate trước khi thay đổi trạng thái
        if (status == BedStatus.MAINTENANCE) {
            bedValidator.validateCanMaintenance(bedId);
        }

        bed.setStatus(status);
        bedRepository.save(bed);
    }

    @Transactional(readOnly = true)
    public BedResponse getBed(UUID bedId) {
        return bedMapper.toResponse(findById(bedId));
    }

    @Transactional(readOnly = true)
    public List<BedResponse> getBedsByRoom(UUID roomId) {
        return bedRepository.findByRoom_RoomId(roomId).stream()
                .map(bedMapper::toResponse)
                .collect(Collectors.toList());
    }



    /**
     * Logic kiểm tra chặt chẽ trước khi xóa (nếu hệ thống cho phép xóa).
     */
    public void validateBedCanDelete(UUID bedId) {
        boolean hasActiveAssignment = assignmentRepository.existsByBed_BedIdAndStatusIn(
                bedId,
                List.of(AssignmentStatus.RESERVED, AssignmentStatus.OCCUPIED)
        );

        if (hasActiveAssignment) {
            throw new AppException(
                    "Cannot delete bed: This bed is currently linked to an active assignment",
                    HttpStatus.CONFLICT
            );
        }
    }

    private Bed findById(UUID id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new AppException("Bed not found", HttpStatus.NOT_FOUND));
    }
}