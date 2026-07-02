# Tích hợp Thiết bị IoT và Xử lý Sự kiện
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này mô tả chi tiết cách Module `SmartAccess` tích hợp với các thiết bị IoT (ESP32) tại cổng ra vào thông qua giao thức MQTT và cách các sự kiện được sử dụng để điều phối hoạt động.

---

## 1. Giao thức MQTT

MQTT (Message Queuing Telemetry Transport) là giao thức được lựa chọn để giao tiếp giữa backend và các thiết bị IoT do tính gọn nhẹ, hiệu quả và hỗ trợ giao tiếp hai chiều.

*   **MQTT Broker:** Một máy chủ trung gian chịu trách nhiệm nhận và phân phối tin nhắn. Cả backend và các thiết bị ESP32 đều kết nối đến Broker này.
*   **Topic:** Các kênh thông tin. Thiết bị sẽ "publish" (gửi) tin nhắn lên một topic, và backend sẽ "subscribe" (lắng nghe) topic đó để nhận tin, và ngược lại.

## 2. Luồng Giao tiếp qua MQTT

### A. Chiều từ Thiết bị lên Backend (Device to Cloud)

*   **Topic:** `sdms/gate/{gateId}/verify`
    *   `{gateId}` là mã định danh duy nhất của mỗi cổng (ví dụ: `main-gate-01`).
*   **Payload (Nội dung tin nhắn):** Một chuỗi JSON chứa thông tin xác thực.
    *   **Ví dụ khi dùng RFID:**
        ```json
        {
          "messageId": "uuid-cho-moi-tin-nhan",
          "timestamp": "2026-06-25T10:00:00Z",
          "method": "RFID",
          "data": "ma-the-rfid"
        }
        ```
    *   **Ví dụ khi dùng Khuôn mặt:**
        ```json
        {
          "messageId": "uuid-cho-moi-tin-nhan",
          "timestamp": "2026-06-25T10:00:00Z",
          "method": "FACE",
          "data": "base64-encoded-image-data"
        }
        ```
*   **Hành động của Backend:**
    1.  Một `MqttInboundAdapter` (được cấu hình với Spring Integration) sẽ lắng nghe topic này.
    2.  Khi có tin nhắn, nó sẽ được chuyển đến một `ServiceActivator` (`SmartAccessMqttHandler`).
    3.  `SmartAccessMqttHandler` sẽ phân tích payload và bắt đầu luồng xử lý kiểm soát ra vào như đã mô tả trong tài liệu `access-control-flow.md`.

### B. Chiều từ Backend xuống Thiết bị (Cloud to Device)

*   **Topic:** `sdms/gate/{gateId}/decision`
*   **Payload (Nội dung tin nhắn):** Một chuỗi JSON chứa quyết định và lệnh.
    *   **Ví dụ khi cho phép:**
        ```json
        {
          "decision": "GRANTED",
          "command": "OPEN_DOOR",
          "message": "Xin mời vào!"
        }
        ```
    *   **Ví dụ khi từ chối:**
        ```json
        {
          "decision": "DENIED",
          "command": "REJECT",
          "message": "Truy cập bị từ chối: Đang trong giờ giới nghiêm."
        }
        ```
*   **Hành động của Backend:**
    1.  Sau khi luồng xử lý ra quyết định cuối cùng, một sự kiện `AccessGrantedEvent` hoặc `AccessDeniedEvent` sẽ được phát ra.
    2.  Một `MqttCommandPublisher` sẽ lắng nghe các sự kiện này.
    3.  Nó sẽ tạo payload tương ứng và "publish" tin nhắn đến đúng topic `sdms/gate/{gateId}/decision`.
*   **Hành động của Thiết bị:**
    1.  ESP32 lắng nghe topic này.
    2.  Khi nhận được tin nhắn, nó sẽ đọc trường `command`.
    3.  Nếu `command` là `OPEN_DOOR`, nó sẽ kích hoạt rơ-le để mở khóa cửa.
    4.  Nếu `command` là `REJECT`, nó có thể phát ra âm thanh hoặc hiển thị đèn báo lỗi.

## 3. Xử lý Sự kiện Nội bộ

Module `SmartAccess` sử dụng một chuỗi các sự kiện nội bộ để xử lý yêu cầu một cách bất đồng bộ và có trật tự.

*   **`IdentityVerifiedEvent`:**
    *   **Phát ra bởi:** Tầng xác minh danh tính (RFID/Face).
    *   **Lắng nghe bởi:** `EligibilityEvaluationService`.
    *   **Mục đích:** Kích hoạt việc kiểm tra xem sinh viên có phải là nội trú hợp lệ hay không.

*   **`IdentityFailedEvent`:**
    *   **Phát ra bởi:** Tầng xác minh danh tính.
    *   **Lắng nghe bởi:** `IdentityFailedEventListener`.
    *   **Mục đích:** Ghi log lại các lần xác thực thất bại (có thể dùng để phát hiện tấn công) và gửi thông báo từ chối.

*   **`AccessGrantedEvent` / `AccessDeniedEvent`:**
    *   **Phát ra bởi:** Tầng ra quyết định cuối cùng (`AccessEvaluationService`).
    *   **Lắng nghe bởi:** `MqttCommandPublisher` và `AccessHistoryLogger`.
    *   **Mục đích:** Gửi lệnh thực thi xuống thiết bị và ghi lại kết quả vào cơ sở dữ liệu.

## 4. Đối chiếu Code

*   **Cấu hình MQTT:** Cần kiểm tra các file cấu hình Spring Integration (`MqttConfig.java`) để đảm bảo các `InboundAdapter` và `OutboundAdapter` được thiết lập đúng với các topic đã định nghĩa.
*   **Handlers và Publishers:** Các lớp xử lý tin nhắn đến (`SmartAccessMqttHandler`) và gửi tin nhắn đi (`MqttCommandPublisher`) cần được triển khai.
*   **Sự kiện:** Các lớp sự kiện (`IdentityVerifiedEvent`, `AccessGrantedEvent`, v.v.) đã được định nghĩa trong `com.sdms.backend.modules.smartaccess.event`. Các listener tương ứng cũng cần được triển khai đầy đủ.
*   **Lỗ hổng:** Việc kết nối toàn bộ chuỗi xử lý này - từ `MqttInboundAdapter` -> `ServiceActivator` -> chuỗi các service và sự kiện -> `MqttCommandPublisher` - là một công việc phức tạp và cần được rà soát kỹ lưỡng để đảm bảo không có bước nào bị bỏ sót.
