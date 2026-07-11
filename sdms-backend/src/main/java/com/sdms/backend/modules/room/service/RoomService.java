package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.dto.request.CreateRoomRequest;
import com.sdms.backend.modules.room.dto.request.UpdateRoomRequest;
import com.sdms.backend.modules.room.dto.response.RoomResponse;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.mapper.RoomMapper;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.validator.RoomValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.room.repository.RoomSpecification;
import com.sdms.backend.modules.room.dto.response.OccupancyAnalyticsResponse;
import com.sdms.backend.modules.room.dto.response.RevenueAtRiskResponse;
import com.sdms.backend.modules.room.dto.response.MaintenanceReportResponse;
import com.sdms.backend.modules.room.service.integration.PaymentIntegrationService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý các nghiệp vụ quản lý Phòng (Room).
 * Tích hợp chặt chẽ với RoomValidator (ROOM-04) bảo đảm an toàn dữ liệu tích hợp cho phân hệ AI/IoT.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final FloorRepository floorRepository;
    private final RoomMapper roomMapper;

    // ROOM-04 INTEGRATION: Thay thế việc gọi trực tiếp AssignmentRepository bằng RoomValidator lớp chuyên trách
    private final RoomValidator roomValidator;
    
    // Tích hợp thanh toán
    private final PaymentIntegrationService paymentIntegrationService;

    public RoomResponse createRoom(CreateRoomRequest request) {
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new AppException("Floor not found", HttpStatus.NOT_FOUND));

        String normalizedCode = request.getRoomCode().trim().toUpperCase();
        if (roomRepository.existsByFloor_FloorIdAndRoomCode(floor.getFloorId(), normalizedCode)) {
            throw new AppException("Room code already exists in this floor", HttpStatus.BAD_REQUEST);
        }

        Room room = new Room();
        room.setFloor(floor);
        room.setRoomCode(normalizedCode);
        room.setCapacity(request.getCapacity());
        room.setOccupiedBeds(0);
        room.setStatus(RoomStatus.AVAILABLE);

        // Sinh mã PIN ngẫu nhiên 6 chữ số cho phòng
        java.security.SecureRandom random = new java.security.SecureRandom();
        int pin = 100000 + random.nextInt(900000);
        room.setRoomPinCode(String.valueOf(pin));

        return roomMapper.toResponse(roomRepository.save(room));
    }

    public RoomResponse updateRoom(UUID roomId, UpdateRoomRequest request) {
        Room room = findById(roomId);

        // ROOM-04 STEP 03 Fix: Ép kiểm tra sức chứa (Capacity) dựa trên nguồn sự thật Assignment thay vì đếm biến thô
        if (request.getCapacity() != null) {
            roomValidator.validateCapacity(roomId, request.getCapacity());
            room.setCapacity(request.getCapacity());
        }

        // ROOM-04 STEP 02: Định tuyến kiểm tra chuyển đổi trạng thái (Transition Validation)
        // Đảm bảo an toàn cho cả luồng trạng thái CLOSED và MAINTENANCE từ bất kỳ trạng thái gốc nào (AVAILABLE/FULL)
        if (request.getStatus() != null && request.getStatus() != room.getStatus()) {
            roomValidator.validateStatusTransition(roomId, request.getStatus());
            room.setStatus(request.getStatus());
        }

        return roomMapper.toResponse(roomRepository.save(room));
    }

    public void changeStatus(UUID roomId, RoomStatus status) {
        Room room = findById(roomId);

        // ROOM-04: Kiểm tra tính an toàn chuyển đổi trạng thái trước khi lưu xuống DB
        if (status != room.getStatus()) {
            roomValidator.validateStatusTransition(roomId, status);
        }

        room.setStatus(status);
        roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoom(UUID roomId) {
        return roomMapper.toResponse(findById(roomId));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByFloor(UUID floorId) {
        return roomRepository.findByFloor_FloorId(floorId).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<RoomResponse> searchRooms(UUID buildingId, UUID floorId, RoomStatus status, Gender policy, Pageable pageable) {
        Specification<Room> spec = RoomSpecification.filterRooms(buildingId, floorId, status, policy);
        Page<Room> roomPage = roomRepository.findAll(spec, pageable);
        return roomPage.map(roomMapper::toResponse);
    }

    // ========================================================================
    // ANALYTICS METHODS FOR ADMIN DASHBOARD
    // ========================================================================

    @Cacheable(value = "analytics_occupancy", key = "'occupancy'")
    @Transactional(readOnly = true)
    public OccupancyAnalyticsResponse getOccupancyAnalytics() {
        List<Room> rooms = roomRepository.findAll();
        int totalCapacity = rooms.stream().mapToInt(Room::getCapacity).sum();
        int totalOccupied = rooms.stream().mapToInt(Room::getOccupiedBeds).sum();
        
        double occupancyRate = totalCapacity == 0 ? 0 : (double) totalOccupied / totalCapacity * 100;
        
        String recommendation = "Tỷ lệ lấp đầy ổn định.";
        if (occupancyRate < 40.0) {
            recommendation = "Tỷ lệ lấp đầy quá thấp, đề xuất dồn sinh viên vào các phòng khác để tiết kiệm chi phí vận hành.";
        }
        
        return OccupancyAnalyticsResponse.builder()
                .overallOccupancyRate(occupancyRate)
                .recommendationAction(recommendation)
                .build();
    }
    
    @Cacheable(value = "roomEmergencyRelocation")
    @Transactional(readOnly = true)
    public List<RoomResponse> getEmergencyRelocationRooms() {
        List<Room> availableRooms = roomRepository.findAll().stream()
            .filter(r -> r.getStatus() == RoomStatus.AVAILABLE && r.getOccupiedBeds() < r.getCapacity())
            .collect(Collectors.toList());
        return availableRooms.stream().map(roomMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RevenueAtRiskResponse getRevenueAtRisk() {
        // Tích hợp Loose Coupling: Lấy danh sách giường bị nợ tiền từ module Payment
        var overdueMap = paymentIntegrationService.getOverduePaymentsByBed();
        
        List<RevenueAtRiskResponse.OverdueRecord> records = overdueMap.entrySet().stream()
                .map(entry -> RevenueAtRiskResponse.OverdueRecord.builder()
                        .bedCode(entry.getKey())
                        .amountDue(entry.getValue())
                        .daysOverdue(15) // Giả lập
                        .build())
                .collect(Collectors.toList());

        double totalRisk = records.stream().mapToDouble(RevenueAtRiskResponse.OverdueRecord::getAmountDue).sum();

        return RevenueAtRiskResponse.builder()
                .totalAmountAtRisk(totalRisk)
                .totalOverdueBeds(records.size())
                .overdueRecords(records)
                .build();
    }

    @Transactional(readOnly = true)
    public MaintenanceReportResponse getMaintenanceReport() {
        // Lấy danh sách các phòng đang bảo trì
        List<Room> maintenanceRooms = roomRepository.findByStatus(RoomStatus.MAINTENANCE);
        
        List<MaintenanceReportResponse.MaintenanceRecord> records = maintenanceRooms.stream()
                .map(r -> MaintenanceReportResponse.MaintenanceRecord.builder()
                        .roomCode(r.getRoomCode())
                        .issueDescription("Phòng đang trong trạng thái khóa bảo trì. Xem thêm chi tiết ở Ticket.")
                        .expectedCompletionDate("Đang xử lý")
                        .build())
                .collect(Collectors.toList());
                
        return MaintenanceReportResponse.builder()
                .totalRoomsUnderMaintenance(records.size())
                .records(records)
                .build();
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private Room findById(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new AppException("Room not found", HttpStatus.NOT_FOUND));
    }
}