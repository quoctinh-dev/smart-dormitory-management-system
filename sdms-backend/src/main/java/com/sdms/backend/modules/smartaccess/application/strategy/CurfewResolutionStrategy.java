package com.sdms.backend.modules.smartaccess.application.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewPolicy;
import com.sdms.backend.modules.smartaccess.domain.repository.CurfewPolicyRepository;

import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Mục tiêu/Nghiệp vụ: Đánh giá xem sinh viên có được phép ra/vào KTX tại một thời điểm nhất định hay không dựa trên các quy định giờ giới nghiêm (Curfew Policy) của từng tòa nhà.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Áp dụng Strategy Pattern để đóng gói thuật toán xử lý giờ giới nghiêm. Hệ thống lấy ra policy có độ ưu tiên cao nhất (Priority) để quyết định.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích cho hội đồng tại sao dùng toán tử Tuyển OR cho giờ giới nghiêm qua đêm trong hàm isTimeInWindow: Vì thời gian bắt đầu (VD: 23:00) lớn hơn thời gian kết thúc (VD: 05:00 sáng hôm sau). Một mốc thời gian T nằm trong khoảng này nếu T > 23:00 HOẶC T < 05:00. Ngược lại, nếu trong cùng một ngày, dùng toán tử AND.
 */
@Component
@RequiredArgsConstructor
public class CurfewResolutionStrategy {

    private final CurfewPolicyRepository curfewPolicyRepository;

    public boolean isAllowed(UUID buildingId, LocalTime currentTime) {
        List<CurfewPolicy> activePolicies = curfewPolicyRepository.findByBuildingIdAndIsActiveTrue(buildingId);
        
        if (activePolicies.isEmpty()) {
            return true; // No curfew defined, default allow
        }

        // Lấy policy có mức độ ưu tiên cao nhất để áp dụng, cho phép ghi đè linh hoạt
        Optional<CurfewPolicy> highestPriorityPolicy = activePolicies.stream()
                .max(Comparator.comparingInt(CurfewPolicy::getPriority));

        if (highestPriorityPolicy.isPresent()) {
            CurfewPolicy policy = highestPriorityPolicy.get();
            return !isTimeInWindow(currentTime, policy.getStartTime(), policy.getEndTime());
        }

        return true;
    }

    private boolean isTimeInWindow(LocalTime currentTime, LocalTime start, LocalTime end) {
        if (start.isBefore(end)) {
            return currentTime.isAfter(start) && currentTime.isBefore(end);
        } else {
            // Xử lý khung giờ qua đêm (VD: 23:00 hôm trước đến 05:00 hôm sau) bằng toán tử OR (Tuyển)
            return currentTime.isAfter(start) || currentTime.isBefore(end);
        }
    }
}
