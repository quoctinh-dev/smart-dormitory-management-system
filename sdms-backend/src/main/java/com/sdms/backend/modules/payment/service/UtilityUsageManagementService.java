package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.request.RecordUtilityRequest;
import com.sdms.backend.modules.payment.dto.response.RoomUtilityResponse;
import com.sdms.backend.modules.payment.entity.UtilityType;
import com.sdms.backend.modules.payment.entity.UtilityUsage;
import com.sdms.backend.modules.payment.event.UtilityBillCalculatedEvent;
import com.sdms.backend.modules.payment.repository.UtilityUsageRepository;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.RoomSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UtilityUsageManagementService {

    private final RoomRepository roomRepository;
    private final UtilityUsageRepository utilityUsageRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getRoomsForUtilityRecording(int month, int year, UtilityType utilityType, UUID buildingId, UUID floorId) {
        Specification<Room> spec = (root, query, cb) -> cb.conjunction();
        if (buildingId != null) {
            spec = spec.and(RoomSpecification.hasBuildingId(buildingId));
        }
        if (floorId != null) {
            spec = spec.and(RoomSpecification.hasFloorId(floorId));
        }
        
        List<Room> rooms = roomRepository.findAll(spec);

        return rooms.stream().map(room -> {
            // Find the last usage record for this room and utility type
            Optional<UtilityUsage> lastUsageOpt = utilityUsageRepository
                    .findTopByRoomIdAndUtilityTypeOrderByYearDescMonthDesc(room.getRoomId(), utilityType);
            
            // Default to 0 if this room has never been recorded
            int oldReading = lastUsageOpt.map(UtilityUsage::getNewReading).orElse(0);

            // Check if there is already a record for the requested month and year
            Optional<UtilityUsage> currentMonthUsageOpt = utilityUsageRepository
                    .findByRoomIdAndUtilityTypeAndMonthAndYear(room.getRoomId(), utilityType, month, year);

            Integer newReading = null;
            boolean isSettled = false;

            if (currentMonthUsageOpt.isPresent()) {
                UtilityUsage currentUsage = currentMonthUsageOpt.get();
                newReading = currentUsage.getNewReading();
                isSettled = currentUsage.getIsSettled();
            }

            return RoomUtilityResponse.builder()
                    .roomId(room.getRoomId())
                    .roomCode(room.getRoomCode())
                    .oldReading(oldReading)
                    .newReading(newReading)
                    .isSettled(isSettled)
                    .isFirstRecord(lastUsageOpt.isEmpty())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void recordUtility(RecordUtilityRequest request, UtilityType utilityType) {
        // Validate room
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phòng"));

        // Check if already settled
        Optional<UtilityUsage> existingUsage = utilityUsageRepository
                .findByRoomIdAndUtilityTypeAndMonthAndYear(request.getRoomId(), utilityType, request.getMonth(), request.getYear());

        if (existingUsage.isPresent() && Boolean.TRUE.equals(existingUsage.get().getIsSettled())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Phòng này đã được chốt chỉ số điện nước trong tháng");
        }

        // Get old reading
        int oldReading = 0;
        Optional<UtilityUsage> lastUsageOpt = utilityUsageRepository
                .findTopByRoomIdAndUtilityTypeOrderByYearDescMonthDesc(room.getRoomId(), utilityType);

        if (lastUsageOpt.isPresent()) {
            UtilityUsage lastUsage = lastUsageOpt.get();
            // Don't use the current month's record as the "old" reading if updating
            if (lastUsage.getMonth().equals(request.getMonth()) && lastUsage.getYear().equals(request.getYear())) {
                // The actual "old" reading is the oldReading from this record
                oldReading = lastUsage.getOldReading();
            } else {
                oldReading = lastUsage.getNewReading();
            }
        } else {
            // Lần đầu tiên chốt phòng, bắt buộc phải cung cấp oldReading
            if (request.getOldReading() == null) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Vui lòng cung cấp chỉ số cũ cho lần chốt đầu tiên của phòng này");
            }
            oldReading = request.getOldReading();
        }

        // Validate reading
        if (request.getNewReading() < oldReading) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ số mới không thể nhỏ hơn chỉ số cũ (" + oldReading + ")");
        }

        int totalUsage = request.getNewReading() - oldReading;

        // Save or update
        UtilityUsage usage = existingUsage.orElseGet(UtilityUsage::new);
        usage.setRoomId(room.getRoomId());
        usage.setUtilityType(utilityType);
        usage.setMonth(request.getMonth());
        usage.setYear(request.getYear());
        usage.setOldReading(oldReading);
        usage.setNewReading(request.getNewReading());
        usage.setTotalUsage(totalUsage);
        usage.setIsSettled(true); // Mark as settled immediately upon recording

        usage = utilityUsageRepository.save(usage);

        log.info("Recorded manual {} for room {}, month {}/{}: {} units", 
                utilityType, room.getRoomCode(), request.getMonth(), request.getYear(), totalUsage);

        // Publish event to trigger billing for both electricity and water
        eventPublisher.publishEvent(new UtilityBillCalculatedEvent(
                room.getRoomId(), 
                utilityType,
                totalUsage, 
                request.getMonth(), 
                request.getYear(), 
                usage.getId()
        ));
    }
}
