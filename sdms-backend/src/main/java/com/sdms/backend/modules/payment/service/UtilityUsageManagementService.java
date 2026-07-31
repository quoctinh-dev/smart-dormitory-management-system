package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.request.RecordUtilityRequest;
import com.sdms.backend.modules.payment.dto.response.RoomUtilityResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.entity.UtilityUsage;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.enums.UtilityType;
import com.sdms.backend.modules.payment.event.UtilityBillCalculatedEvent;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.repository.UtilityUsageRepository;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.RoomSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service quản lý chỉ số tiêu thụ điện / nước của các phòng KTX.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UtilityUsageManagementService {

    private final RoomRepository roomRepository;
    private final UtilityUsageRepository utilityUsageRepository;
    private final BillRepository billRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Lấy danh sách các phòng phục vụ cho giao diện chốt chỉ số điện/nước theo tháng/năm.
     *
     * @param month Tháng cần truy vấn
     * @param year Năm cần truy vấn
     * @param utilityType Loại tiện ích (ELECTRIC / WATER)
     * @param buildingId Mã tòa nhà (Lọc tùy chọn)
     * @param floorId Mã tầng (Lọc tùy chọn)
     * @return Danh sách thông tin chốt số của các phòng
     */
    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getRoomsForUtilityRecording(int month, int year, UtilityType utilityType, UUID buildingId, UUID floorId) {
        // 1. Khởi tạo bộ lọc tìm kiếm phòng
        Specification<Room> spec = (root, query, cb) -> cb.conjunction();
        if (buildingId != null) {
            spec = spec.and(RoomSpecification.hasBuildingId(buildingId));
        }
        if (floorId != null) {
            spec = spec.and(RoomSpecification.hasFloorId(floorId));
        }

        List<Room> rooms = roomRepository.findAll(spec);

        // 2. Duyệt từng phòng để tính toán thông tin chỉ số cũ/mới
        return rooms.stream().map(room -> {
            // Tìm bản ghi chốt số của tháng đang truy vấn
            Optional<UtilityUsage> currentMonthUsageOpt = utilityUsageRepository
                    .findByRoomIdAndUtilityTypeAndMonthAndYear(room.getRoomId(), utilityType, month, year);

            // Tìm bản ghi chốt số của tháng liền trước đó (dùng làm chỉ số cũ chuẩn)
            int prevMonth = month == 1 ? 12 : month - 1;
            int prevYear = month == 1 ? year - 1 : year;
            Optional<UtilityUsage> prevMonthUsageOpt = utilityUsageRepository
                    .findByRoomIdAndUtilityTypeAndMonthAndYear(room.getRoomId(), utilityType, prevMonth, prevYear);

            // Tìm bản ghi MỚI NHẤT trong DB để xác định phòng này đã TỪNG được ghi chỉ số bao giờ chưa
            Optional<UtilityUsage> absoluteLastUsageOpt = utilityUsageRepository
                    .findTopByRoomIdAndUtilityTypeOrderByYearDescMonthDesc(room.getRoomId(), utilityType);

            // Xác định chỉ số cũ (oldReading)
            int oldReading = 0;
            if (currentMonthUsageOpt.isPresent()) {
                // Nếu tháng này đã chốt, lấy lại chính xác oldReading lúc chốt
                oldReading = currentMonthUsageOpt.get().getOldReading() != null ? currentMonthUsageOpt.get().getOldReading() : 0;
            } else if (prevMonthUsageOpt.isPresent()) {
                // Nếu tháng này chưa chốt, lấy newReading của tháng trước đó làm oldReading
                oldReading = prevMonthUsageOpt.get().getNewReading() != null ? prevMonthUsageOpt.get().getNewReading() : 0;
            } else {
                // Không có dữ liệu tháng trước
                oldReading = 0;
            }

            Integer newReading = null;
            boolean isSettled = false;

            // Nếu đã chốt tháng này thì lấy chỉ số mới và trạng thái đã chốt
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
                    .isFirstRecord(absoluteLastUsageOpt.isEmpty()) // Đánh dấu lần đầu ghi chỉ số
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Thực hiện chốt (ghi nhận) chỉ số điện/nước cho một phòng.
     *
     * @param request Thông tin ghi nhận chỉ số (roomId, month, year, newReading, ...)
     * @param utilityType Loại tiện ích (ELECTRIC / WATER)
     */
    @Transactional
    public void recordUtility(RecordUtilityRequest request, UtilityType utilityType) {

        // 1. Kiểm tra sự tồn tại của phòng
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phòng"));

        // 2. Kiểm tra xem tháng này phòng đã chốt chỉ số chưa
        Optional<UtilityUsage> existingUsage = utilityUsageRepository
                .findByRoomIdAndUtilityTypeAndMonthAndYear(request.getRoomId(), utilityType, request.getMonth(), request.getYear());

        if (existingUsage.isPresent() && Boolean.TRUE.equals(existingUsage.get().getIsSettled())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Phòng này đã được chốt chỉ số điện nước trong tháng");
        }

        // 3. Xác định chỉ số cũ (oldReading)
        int oldReading = 0;
        Optional<UtilityUsage> lastUsageOpt = utilityUsageRepository
                .findTopByRoomIdAndUtilityTypeOrderByYearDescMonthDesc(room.getRoomId(), utilityType);

        if (lastUsageOpt.isPresent()) {
            UtilityUsage lastUsage = lastUsageOpt.get();
            // Nếu bản ghi mới nhất chính là tháng/năm hiện tại (đang cập nhật lại)
            if (lastUsage.getMonth().equals(request.getMonth()) && lastUsage.getYear().equals(request.getYear())) {
                oldReading = lastUsage.getOldReading();
            } else {
                // Lấy newReading của tháng gần nhất làm oldReading cho tháng này
                oldReading = lastUsage.getNewReading();
            }
        } else {
            // Lần đầu tiên ghi nhận chỉ số cho phòng này bắt buộc phải gửi oldReading
            if (request.getOldReading() == null) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Vui lòng cung cấp chỉ số cũ cho lần chốt đầu tiên của phòng này");
            }
            oldReading = request.getOldReading();
        }

        // 4. Kiểm tra hợp lệ: Chỉ số mới không được nhỏ hơn chỉ số cũ
        if (request.getNewReading() < oldReading) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ số mới không thể nhỏ hơn chỉ số cũ (" + oldReading + ")");
        }

        // 5. Tính tổng sản lượng tiêu thụ
        int totalUsage = request.getNewReading() - oldReading;

        // 6. Lưu thông tin chỉ số điện/nước vào DB
        UtilityUsage usage = existingUsage.orElseGet(UtilityUsage::new);
        usage.setRoomId(room.getRoomId());
        usage.setUtilityType(utilityType);
        usage.setMonth(request.getMonth());
        usage.setYear(request.getYear());
        usage.setOldReading(oldReading);
        usage.setNewReading(request.getNewReading());
        usage.setTotalUsage(totalUsage);
        usage.setIsSettled(true);

        usage = utilityUsageRepository.save(usage);

        log.info("Recorded manual {} for room {}, month {}/{}: {} units",
                utilityType, room.getRoomCode(), request.getMonth(), request.getYear(), totalUsage);

        // 7. Bắn Event để hệ thống tự động tính tiền và tạo Hóa đơn (Bill) tương ứng
        eventPublisher.publishEvent(new UtilityBillCalculatedEvent(
                room.getRoomId(),
                utilityType,
                totalUsage,
                request.getMonth(),
                request.getYear(),
                usage.getId()
        ));
    }

    /**
     * Hủy kết quả chốt số điện/nước của một phòng trong tháng (nếu hóa đơn chưa được thanh toán).
     *
     * @param roomId Mã phòng
     * @param month Tháng cần hủy
     * @param year Năm cần hủy
     * @param utilityType Loại tiện ích (ELECTRIC / WATER)
     */
    @Transactional
    public void cancelUtilityRecord(UUID roomId, int month, int year, UtilityType utilityType) {
        // 1. Tìm bản ghi chốt điện/nước tháng này
        UtilityUsage usage = utilityUsageRepository
                .findByRoomIdAndUtilityTypeAndMonthAndYear(roomId, utilityType, month, year)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy dữ liệu chốt số của tháng này"));

        // 2. Tìm danh sách Hóa đơn (Bill) tương ứng được phát sinh từ lần chốt này
        BillType billType = BillType.ELECTRIC_FEE;
        String monthYearStr = String.format("tháng %d/%d", month, year);

        List<Bill> relatedBills = billRepository.findByRoomIdAndBillType(roomId, billType).stream()
                .filter(bill -> bill.getDescription() != null && bill.getDescription().contains(monthYearStr))
                .toList();

        // 3. Kiểm tra xem hóa đơn đã được thanh toán (hoặc thanh toán một phần) chưa
        for (Bill bill : relatedBills) {
            if (bill.getStatus() == BillStatus.PAID || bill.getStatus() == BillStatus.PARTIALLY_PAID) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Không thể hủy chốt vì Hóa đơn đã được thanh toán hoặc thanh toán một phần.");
            }
        }

        // 4. Nếu hóa đơn chưa thanh toán -> Xóa toàn bộ hóa đơn liên quan
        if (!relatedBills.isEmpty()) {
            billRepository.deleteAll(relatedBills);
            log.info("Deleted {} unpaid bills for room {} for {} {}", relatedBills.size(), roomId, utilityType, monthYearStr);
        }

        // 5. Xóa bản ghi chốt số điện/nước
        utilityUsageRepository.delete(usage);
        log.info("Cancelled utility record for room {}, {} {}", roomId, utilityType, monthYearStr);
    }
}