# Tích hợp Thiết bị IoT và Xử lý Sự kiện
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này mô tả chi tiết cách Module `SmartAccess` tích hợp với các thiết bị IoT (ESP32) tại cổng ra vào thông qua giao thức MQTT và cách các sự kiện được sử dụng để điều phối hoạt động.

---

## 1. Tổng quan Giao thức Giao tiếp

Hệ thống sử dụng kết hợp hai giao thức để tối ưu hóa việc giao tiếp giữa thiết bị IoT (ESP32) và Backend:
1. **HTTP POST:** Dùng cho luồng ESP32 gửi yêu cầu xác thực (ảnh khuôn mặt hoặc mã RFID) lên Backend. HTTP phù hợp để truyền tải dữ liệu (đặc biệt là dữ liệu lớn như multipart file ảnh) và nhận phản hồi trực tiếp một cách đồng bộ.
2. **MQTT (Message Queuing Telemetry Transport):** Dùng cho luồng điều khiển từ Backend chủ động "push" lệnh xuống thiết bị (Remote Unlock, Emergency, Offline Sync).

## 2. Luồng Giao tiếp Chi tiết

### A. Chiều từ Thiết bị lên Backend (Thiết bị -> Backend qua HTTP)

*   **API Endpoints (HTTP POST):**
    *   `/api/v1/smartaccess/verify/face` (Multipart form-data)
    *   `/api/v1/smartaccess/verify/card` (JSON)
*   **Hành động của Thiết bị:**
    1.  Khi có sự kiện (quét thẻ hoặc nhận diện khuôn mặt), ESP32 gọi trực tiếp HTTP POST đến endpoint tương ứng của Backend.
    2.  Chờ và parse phản hồi JSON từ Backend.
*   **Hành động của Backend:**
    1.  `IotVerificationController` tiếp nhận yêu cầu HTTP.
    2.  Thực hiện luồng kiểm tra (như mô tả trong `03_ACCESS_CONTROL_FLOW.md`) thông qua các Events nội bộ.
    3.  Trả về HTTP Response JSON (ví dụ: `{"status": "GRANTED"}` hoặc `{"status": "DENIED"}`) trực tiếp cho ESP32.

### B. Chiều từ Backend xuống Thiết bị (Backend -> Thiết bị qua MQTT)

*   **Mục đích:** Các lệnh điều khiển hệ thống, quản lý vận hành từ xa.

**Bảng MQTT Topics thực tế đang sử dụng:**

| Topic | Mục đích |
|---|---|
| `sdms/gates/{gateId}/command` | **Remote Unlock** — Gửi lệnh mở 1 cổng cụ thể từ admin. |
| `sdms/gates/building/{buildingId}/command` | **Emergency** — Phát lệnh tới toàn bộ cổng trong 1 tòa nhà cụ thể. |
| `sdms/gates/system/broadcast` | **Emergency Broadcast** — Phát lệnh khẩn cấp tới mọi cổng toàn hệ thống. |
| `sdms/gates/system/whitelist` | **Offline Sync** — Đẩy danh sách RFID hợp lệ về ESP32 để lưu trữ offline. |

*   **Hành động của Backend:**
    1.  Từ các API quản trị của Admin, hệ thống kích hoạt lệnh tương ứng.
    2.  Hệ thống gửi message MQTT dạng JSON thông qua Outbound Gateway vào các topic MQTT tương ứng.
*   **Hành động của Thiết bị (ESP32):**
    1.  ESP32 subscribe vào các topic liên quan (của riêng nó, của tòa nhà và hệ thống chung).
    2.  Khi nhận được message, nó sẽ parse lệnh và thực thi tương ứng (Bật relay mở cửa, cập nhật danh sách thẻ...).

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
