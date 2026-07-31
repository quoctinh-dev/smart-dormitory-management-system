package com.sdms.backend.modules.room.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.dto.request.CreateRoomRequest;
import com.sdms.backend.modules.room.dto.request.UpdateRoomRequest;
import com.sdms.backend.modules.room.dto.response.MaintenanceReportResponse;
import com.sdms.backend.modules.room.dto.response.OccupancyAnalyticsResponse;
import com.sdms.backend.modules.room.dto.response.RevenueAtRiskResponse;
import com.sdms.backend.modules.room.dto.response.RoomResponse;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.enums.RoomRole;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.mapper.RoomMapper;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.RoomSpecification;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.integration.PaymentIntegrationService;
import com.sdms.backend.modules.room.validator.RoomValidator;

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
    private final BedRepository bedRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final RoomMapper roomMapper;

    // TÍCH HỢP ROOM-04: Thay thế việc gọi trực tiếp AssignmentRepository bằng RoomValidator lớp chuyên trách
    private final RoomValidator roomValidator;
    
    // Tích hợp thanh toán
    private final PaymentIntegrationService paymentIntegrationService;

    /**
     * Tạo mới một phòng thuộc tầng chỉ định, tự động sinh mã PIN bảo mật 6 chữ số.
     * 
     * @param request Thông tin yêu cầu khởi tạo phòng
     * @return Thông tin phòng vừa tạo
     */
    public RoomResponse createRoom(CreateRoomRequest request) {
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tầng"));

        String normalizedCode = request.getRoomCode().trim().toUpperCase();
        if (roomRepository.existsByFloor_FloorIdAndRoomCode(floor.getFloorId(), normalizedCode)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Mã phòng đã tồn tại ở tầng này");
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

    /**
     * Cập nhật thông tin phòng (Sức chứa, Trạng thái) có qua lớp kiểm duyệt an toàn RoomValidator.
     * 
     * @param roomId Mã ID phòng cần cập nhật
     * @param request Dữ liệu cập nhật
     * @return Thông tin phòng sau khi cập nhật
     */
    public RoomResponse updateRoom(UUID roomId, UpdateRoomRequest request) {
        Room room = findById(roomId);

        // SỬA LỖI BƯỚC 03 ROOM-04: Ép kiểm tra sức chứa (Capacity) dựa trên nguồn sự thật Assignment thay vì đếm biến thô
        if (request.getCapacity() != null) {
            roomValidator.validateCapacity(roomId, request.getCapacity());
            room.setCapacity(request.getCapacity());
        }

        // BƯỚC 02 ROOM-04: Định tuyến kiểm tra chuyển đổi trạng thái (Transition Validation)
        // Đảm bảo an toàn cho cả luồng trạng thái CLOSED và MAINTENANCE từ bất kỳ trạng thái gốc nào (AVAILABLE/FULL)
        if (request.getStatus() != null && request.getStatus() != room.getStatus()) {
            roomValidator.validateStatusTransition(roomId, request.getStatus());
            room.setStatus(request.getStatus());
        }

        return roomMapper.toResponse(roomRepository.save(room));
    }

    /**
     * Thay đổi trạng thái hoạt động của phòng (AVAILABLE, FULL, MAINTENANCE, CLOSED).
     * 
     * @param roomId Mã ID phòng
     * @param status Trạng thái mới
     */
    public void changeStatus(UUID roomId, RoomStatus status) {
        Room room = findById(roomId);

        // ROOM-04: Kiểm tra tính an toàn chuyển đổi trạng thái trước khi lưu xuống DB
        if (status != room.getStatus()) {
            roomValidator.validateStatusTransition(roomId, status);
        }

        // ĐỒNG BỘ TRẠNG THÁI GIƯỜNG KHI PHÒNG THAY ĐỔI TRẠNG THÁI BẢO TRÌ
        // Chiều 1: AVAILABLE/FULL → MAINTENANCE: Set tất cả giường AVAILABLE → MAINTENANCE
        //          để UI hiển thị màu Xám phản ánh đúng thực tế phòng đang bảo trì.
        // Chiều 2: MAINTENANCE → AVAILABLE: Reset tất cả giường MAINTENANCE → AVAILABLE
        //          để hệ thống có thể gán sinh viên vào phòng sau khi bảo trì xong.
        // Lưu ý: Không bao giờ đụng vào giường OCCUPIED/RESERVED vì thuộc về sinh viên đang ở.
        if (status == RoomStatus.MAINTENANCE) {
            bedRepository.findByRoom_RoomId(roomId).forEach(bed -> {
                if (bed.getStatus() == BedStatus.AVAILABLE) {
                    bed.setStatus(BedStatus.MAINTENANCE);
                    bedRepository.save(bed);
                }
            });
        } else if (status == RoomStatus.AVAILABLE && room.getStatus() == RoomStatus.MAINTENANCE) {
            bedRepository.findByRoom_RoomId(roomId).forEach(bed -> {
                if (bed.getStatus() == BedStatus.MAINTENANCE) {
                    bed.setStatus(BedStatus.AVAILABLE);
                    bedRepository.save(bed);
                }
            });
        }

        room.setStatus(status);
        roomRepository.save(room);
    }


    /**
     * Phân công vai trò quản lý trong phòng (Trưởng phòng / Phó phòng / Thành viên).
     * Tự động hạ cấp Trưởng/Phó phòng cũ nếu có phân công người mới.
     * 
     * @param assignmentId Mã phân bổ giường của sinh viên
     * @param role Vai trò mới trong phòng
     */
    @Transactional
    public void assignRoomRole(UUID assignmentId, RoomRole role) {
        StudentHousingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin phân bổ giường"));
        
        // Đảm bảo 1 phòng chỉ có 1 trưởng, 1 phó. Tự động giáng cấp người cũ nếu gán mới.
        if (role == RoomRole.ROOM_LEADER || role == RoomRole.DEPUTY_LEADER) {
            UUID roomId = assignment.getBed().getRoom().getRoomId();
            List<StudentHousingAssignment> activeAssignmentsInRoom = 
                    assignmentRepository.findByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.OCCUPIED);
            
            for (StudentHousingAssignment other : activeAssignmentsInRoom) {
                if (!other.getAssignmentId().equals(assignmentId) && other.getRoomRole() == role) {
                    other.setRoomRole(RoomRole.MEMBER);
                    assignmentRepository.save(other);
                }
            }
        }

        assignment.setRoomRole(role);
        assignmentRepository.save(assignment);
    }

    /**
     * Lấy chi tiết thông tin một phòng theo Mã ID.
     * 
     * @param roomId Mã ID phòng
     * @return DTO chi tiết phòng
     */
    @Transactional(readOnly = true)
    public RoomResponse getRoom(UUID roomId) {
        return roomMapper.toResponse(findById(roomId));
    }

    /**
     * Lấy danh sách các phòng thuộc về một Tầng cụ thể.
     * 
     * @param floorId Mã ID tầng
     * @return Danh sách DTO phòng
     */
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByFloor(UUID floorId) {
        return roomRepository.findByFloor_FloorId(floorId).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm và phân trang danh sách phòng theo bộ lọc (Tòa, Tầng, Trạng thái, Quy định giới tính).
     * 
     * @param buildingId Mã ID tòa nhà (Tùy chọn)
     * @param floorId Mã ID tầng (Tùy chọn)
     * @param status Trạng thái phòng (Tùy chọn)
     * @param policy Quy định giới tính (Tùy chọn)
     * @param pageable Thông tin phân trang
     * @return Trang danh sách phòng thỏa điều kiện
     */
    @Transactional(readOnly = true)
    public Page<RoomResponse> searchRooms(UUID buildingId, UUID floorId, RoomStatus status, Gender policy, Pageable pageable) {
        Specification<Room> spec = RoomSpecification.filterRooms(buildingId, floorId, status, policy);
        Page<Room> roomPage = roomRepository.findAll(spec, pageable);
        return roomPage.map(roomMapper::toResponse);
    }

    // ========================================================================
    // CÁC PHƯƠNG THỨC THỐNG KÊ CHO ADMIN DASHBOARD
    // ========================================================================

    /**
     * Lấy phân tích tỷ lệ lấp đầy KTX phục vụ Admin Dashboard (Có sử dụng Spring Cache).
     * 
     * @return DTO chứa tỷ lệ lấp đầy và khuyến nghị hành động
     */
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
    
    /**
     * Lấy danh sách các phòng còn trống sẵn sàng phục vụ chuyển phòng khẩn cấp.
     * 
     * @return Danh sách phòng khả dụng
     */
    @Cacheable(value = "roomEmergencyRelocationV3")
    @Transactional(readOnly = true)
    public List<RoomResponse> getEmergencyRelocationRooms() {
        List<Room> availableRooms = roomRepository.findAll().stream()
            .filter(r -> r.getStatus() == RoomStatus.AVAILABLE && r.getOccupiedBeds() < r.getCapacity())
            .collect(Collectors.toList());
        return availableRooms.stream().map(roomMapper::toResponse).collect(Collectors.toList());
    }

    /**
     * Báo cáo rủi ro doanh thu từ các giường/phòng đang quá hạn thanh toán tiền ở.
     * 
     * @return DTO báo cáo doanh thu bị đe dọa do nợ phí
     */
    @Transactional(readOnly = true)
    public RevenueAtRiskResponse getRevenueAtRisk() {
        // Tích hợp Luyện liên kết lỏng (Loose Coupling): Lấy danh sách giường bị nợ tiền từ module Payment
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

    /**
     * Lấy báo cáo danh sách các phòng đang trong trạng thái khóa bảo trì.
     * 
     * @return DTO chứa thông tin các phòng đang bảo trì
     */
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
    // LOGIC XÓA PHÒNG (CHỈ XÓA CỨNG CHO CÁC PHÒNG CHƯA CÓ LỊCH SỬ)
    // ========================================================================

    /**
     * Xóa hoàn toàn một phòng khỏi hệ thống (Chỉ cho phép xóa cứng đối với phòng chưa từng có sinh viên lưu trú).
     * 
     * @param roomId Mã ID phòng cần xóa
     */
    @Transactional
    public void deleteRoom(UUID roomId) {
        Room room = findById(roomId);
        
        // 1. Kiểm tra xem phòng có lịch sử phân bổ sinh viên nào chưa
        boolean hasHistory = assignmentRepository.existsByBed_Room_RoomId(roomId);

        if (hasHistory) {
            throw new AppException(ErrorCode.DATA_CONFLICT, "Không thể xóa phòng: Phòng này đã có lịch sử sinh viên lưu trú. Vui lòng cập nhật trạng thái phòng thay vì xóa.");
        }

        // 2. Phòng trống và chưa từng có lịch sử lưu trú. An toàn để thực hiện Xóa cứng.
        // Đầu tiên, xóa tất cả các giường thuộc về phòng này
        bedRepository.deleteAll(bedRepository.findByRoom_RoomId(room.getRoomId()));

        // Sau đó xóa chính phòng này
        roomRepository.delete(room);
    }

    /**
     * Hàm trợ giúp tìm kiếm Room theo ID, ném ra ngoại lệ nếu không tìm thấy.
     */
    private Room findById(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy phòng"));
    }
}