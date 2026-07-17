package com.sdms.backend.modules.smartaccess.event;

import lombok.Getter;

import java.util.UUID;

/**
 * Mục tiêu/Nghiệp vụ: Sự kiện mang lệnh điều khiển thực tế (UNLOCK/LOCK) cần gửi xuống thiết bị phần cứng (Cửa/Cổng).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Áp dụng Event-Driven Architecture (Mô hình Hướng sự kiện).
 * Lưu ý Kiến thức (Dành cho phản biện): 
 * - Đây là một Outbound Event (Sự kiện đầu ra). Lớp Service chỉ việc quăng Event này ra (Publish).
 * - Sẽ có một Listener (thuộc lớp Infrastructure/IoT) chực chờ bắt lấy Event này và chuyển hóa nó thành giao thức MQTT hoặc HTTP POST để bắn xuống mạch ESP32.
 * - Điều này giúp tách biệt hoàn toàn Logic nghiệp vụ (Application) khỏi Logic giao tiếp phần cứng (Infrastructure).
 */
@Getter
public class GateCommandEvent {
    private final UUID gateId;
    private final String command; // e.g., "UNLOCK", "LOCK_DOWN"
    private final String reason;

    public GateCommandEvent(UUID gateId, String command, String reason) {
        this.gateId = gateId;
        this.command = command;
        this.reason = reason;
    }
}
