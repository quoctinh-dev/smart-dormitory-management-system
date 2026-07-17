package com.sdms.backend.modules.smartaccess.application.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.sdms.backend.modules.smartaccess.domain.entity.TimeWindowPolicy;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import com.sdms.backend.modules.smartaccess.domain.repository.TimeWindowPolicyRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Mục tiêu/Nghiệp vụ: Kiểm tra xem sinh viên (dựa vào ResidentType: Vãng lai, Ngoại trú, v.v.) có được phép ra/vào tòa nhà trong khung giờ hiện tại hay không.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Áp dụng Strategy Pattern để tách biệt logic kiểm tra khung giờ ra khỏi lớp Service chính. 
 * Lưu ý Kiến thức (Dành cho phản biện): 
 * - Nguyên tắc "Fail-Closed" (Đóng mặc định): Nếu không tìm thấy bất kỳ TimeWindowPolicy nào đang Active, hệ thống tự động TỪ CHỐI truy cập (return false). Điều này đảm bảo an ninh tuyệt đối so với "Fail-Open" (Mở mặc định).
 * - Thuật toán xử lý khung giờ qua đêm: Tương tự Curfew, nếu startTime > endTime (VD: 22:00 -> 02:00), toán tử logic OR (Tuyển) sẽ được kích hoạt thay vì AND (Hội).
 */
@Component
@RequiredArgsConstructor
public class TimeWindowEvaluationStrategy {

    private final TimeWindowPolicyRepository timeWindowPolicyRepository;

    public boolean isAllowed(UUID buildingId, ResidentType residentType, LocalTime currentTime) {
        List<TimeWindowPolicy> policies = timeWindowPolicyRepository
                .findByBuildingIdAndResidentTypeAndIsActiveTrue(buildingId, residentType);

        if (policies.isEmpty()) {
            return false; // Fail Closed: If no window defined, deny access.
        }

        return policies.stream().anyMatch(policy -> isTimeInWindow(currentTime, policy.getStartTime(), policy.getEndTime()));
    }

    private boolean isTimeInWindow(LocalTime currentTime, LocalTime start, LocalTime end) {
        if (start.isBefore(end)) {
            return !currentTime.isBefore(start) && !currentTime.isAfter(end);
        } else {
            // Support for Overnight Windows
            return !currentTime.isBefore(start) || !currentTime.isAfter(end);
        }
    }
}
