# BÁO CÁO KIỂM TOÁN TÍCH HỢP MQTT (MQTT INTEGRATION AUDIT)

**Dự án:** Smart Dormitory Management System (SDMS)
**Phạm vi:** SDMS Backend (Java Spring Boot)
**Mục tiêu:** Trích xuất toàn bộ thông tin cấu hình, luồng dữ liệu và thiết kế MQTT hiện tại để phục vụ tích hợp thiết bị IoT (ESP32-CAM) và kiểm thử.

---

## 1. MQTT Configuration

Thông tin cấu hình MQTT Broker hiện tại trong Backend được định nghĩa tại file cấu hình mặc định, có thể bị ghi đè bởi `application.yml` thông qua các biến môi trường:

*   **File cấu hình chính:** `src/main/java/com/sdms/backend/modules/smartaccess/infrastructure/config/MqttConfig.java`
*   **Broker URL (Host & Port):** `${sdms.mqtt.url:tcp://localhost:1883}` (Mặc định: localhost, port 1883)
*   **Username:** `${sdms.mqtt.username:}` (Mặc định: rỗng)
*   **Password:** `${sdms.mqtt.password:}` (Mặc định: rỗng)
*   **ClientId:** `sdms-backend-pub- + UUID.randomUUID()` (Ví dụ: `sdms-backend-pub-123e4567-e89b-12d3-a456-426614174000`)
*   **Auto Reconnect:** `true` (Cấu hình tự động kết nối lại khi mất mạng)
*   **Clean Session:** `true`
*   **Connection Timeout:** `10` giây

---

## 2. MQTT Libraries

Dự án đang sử dụng các thư viện tích hợp MQTT tiêu chuẩn của hệ sinh thái Spring. 

**Dependencies (Trích từ `pom.xml`):**
```xml
<dependency>
    <groupId>org.springframework.integration</groupId>
    <artifactId>spring-integration-mqtt</artifactId>
</dependency>
<dependency>
    <groupId>org.eclipse.paho</groupId>
    <artifactId>org.eclipse.paho.client.mqttv3</artifactId>
    <version>1.2.5</version>
</dependency>
```
*Ghi chú: Đang sử dụng **Eclipse Paho MQTT v3 Client** thông qua Spring Integration.*

---

## 3. MQTT Beans

Các Spring Bean đảm nhiệm việc giao tiếp MQTT:

1.  **`mqttClientFactory`** (`DefaultMqttPahoClientFactory`)
    *   *Package:* `...infrastructure.config.MqttConfig`
    *   *Nhiệm vụ:* Khởi tạo kết nối tới Broker, thiết lập timeout, session, và credentials.
2.  **`mqttOutboundChannel`** (`DirectChannel`)
    *   *Package:* `...infrastructure.config.MqttConfig`
    *   *Nhiệm vụ:* Kênh message nội bộ của Spring Integration để đẩy dữ liệu ra ngoài.
3.  **`mqttOutbound`** (`MqttPahoMessageHandler`)
    *   *Package:* `...infrastructure.config.MqttConfig`
    *   *Nhiệm vụ:* Đóng vai trò là Service Activator, nhận message từ `mqttOutboundChannel` và publish lên MQTT Broker theo giao thức bất đồng bộ (`async=true`).
4.  **`MqttGateway`** (Interface có `@MessagingGateway`)
    *   *Package:* `...infrastructure.config.MqttGateway`
    *   *Nhiệm vụ:* Cung cấp method `sendToMqtt(topic, payload)` để các Service trong tầng Application dễ dàng gọi mà không bị phụ thuộc vào Spring Integration API.

---

## 4. MQTT Publish

Dưới đây là các vị trí mã nguồn thực hiện việc Publish dữ liệu lên MQTT Broker:

### 4.1. Gate Command Publish
*   **Class:** `SmartAccessMqttListener.java`
*   **Method:** `handleGateCommand(GateCommandEvent event)`
*   **Topic:** `sdms/gates/{gateId}/command`
*   **Payload:** `{"command": "UNLOCK", "reason": "...", "timestamp": 123456789}`
*   **Trigger:** Khi Admin gọi API Remote Unlock thành công.

### 4.2. Emergency Broadcast Publish
*   **Class:** `SmartAccessMqttListener.java`
*   **Method:** `handleSystemEmergency(SystemEmergencyEvent event)`
*   **Topic:** 
    *   `sdms/gates/building/{buildingId}/command` (Nếu khẩn cấp theo tòa)
    *   `sdms/gates/system/broadcast` (Nếu khẩn cấp toàn khu)
*   **Payload:** `{"command": "OPEN_ALL", "reason": "...", "timestamp": 123456789}`
*   **Trigger:** Khi Admin kích hoạt chế độ khẩn cấp (Emergency Override).

### 4.3. Offline Whitelist Sync Publish
*   **Class:** `SmartAccessMqttListener.java`
*   **Method:** `syncWhitelistToEdge()`
*   **Topic:** `sdms/gates/system/whitelist`
*   **Payload:** `{"type": "WHITELIST_SYNC", "count": 10, "data": ["RFID1", "RFID2"], "timestamp": 123456789}`
*   **Trigger:** Tự động gọi mỗi khi có sinh viên Check-out (trả phòng) hoặc được Gán thẻ RFID mới.

---

## 5. MQTT Subscribe

**Trạng thái hiện tại:** CHƯA CÓ SUBSCRIBER NÀO Ở BACKEND.

**Phân tích:** 
Trong kiến trúc hiện hành, Backend chỉ đóng vai trò là **Publisher** gửi lệnh điều khiển (Command) và đồng bộ danh sách (Sync). 
Thiết bị ESP32 giao tiếp ngược lại với Backend (gửi ảnh khuôn mặt, gửi mã thẻ RFID) thông qua **REST API** (`IotVerificationController` - POST `/api/v1/smartaccess/verify/face` và `/verify/card`) chứ không dùng MQTT. Vì vậy, không có `MqttPahoMessageDrivenChannelAdapter` nào được định nghĩa để Subscribe.

---

## 6. MQTT Topic Design

| Topic | Publisher | Subscriber | Payload | Mục đích |
|--------|-----------|------------|----------|----------|
| `sdms/gates/{gateId}/command` | Backend | ESP32 (Gate) | JSON (Command) | Bắn lệnh mở/đóng cửa riêng lẻ cho từng cổng. |
| `sdms/gates/building/{buildingId}/command`| Backend | Các ESP32 trong tòa nhà | JSON (Command) | Mở tất cả các cửa của một tòa nhà khi khẩn cấp. |
| `sdms/gates/system/broadcast` | Backend | Tất cả ESP32 | JSON (Command) | Lệnh hệ thống khẩn cấp, tác động lên toàn bộ KTX. |
| `sdms/gates/system/whitelist` | Backend | Tất cả ESP32 | JSON (Sync) | Đồng bộ mảng mã thẻ RFID để ESP32 lưu cache offline. |

---

## 7. Payload Contract

Dưới đây là cấu trúc JSON cho các Topic đã thiết kế:

**Lệnh mở cửa (UNLOCK):**
```json
{
  "command": "UNLOCK",
  "reason": "Admin remote unlocked",
  "timestamp": 1719238472819
}
```

**Lệnh khẩn cấp (EMERGENCY):**
```json
{
  "command": "OPEN_ALL",
  "reason": "Fire alarm triggered",
  "timestamp": 1719238472819
}
```

**Đồng bộ danh sách ngoại tuyến (WHITELIST_SYNC):**
```json
{
  "type": "WHITELIST_SYNC",
  "count": 3,
  "data": [
    "A1B2C3D4",
    "E5F6G7H8",
    "I9J0K1L2"
  ],
  "timestamp": 1719238472819
}
```

---

## 8. REST API liên quan MQTT

Các REST API sau đây khi gọi thành công sẽ kích hoạt luồng phát sinh Message MQTT:

### Luồng 1: Mở cửa từ xa (Remote Unlock)
```
POST /api/v1/access/gates/{gateId}/unlock
  ↓
RemoteUnlockController.unlockGate()
  ↓
RemoteUnlockService.executeRemoteUnlock()
  ↓ (Ghi lịch sử vào DB xong)
EventPublisher.publishEvent(GateCommandEvent)
  ↓
SmartAccessMqttListener.handleGateCommand()
  ↓
MqttGateway.sendToMqtt("sdms/gates/{gateId}/command", payload)
```

### Luồng 2: Kích hoạt khẩn cấp (Emergency Override)
```
POST /api/v1/access/emergency
  ↓
EmergencyOverrideController.executeOverride()
  ↓
EmergencyOverrideService.executeEmergencyOverride()
  ↓
EventPublisher.publishEvent(SystemEmergencyEvent)
  ↓
SmartAccessMqttListener.handleSystemEmergency()
  ↓
MqttGateway.sendToMqtt("sdms/gates/building/{id}/command", payload)
```

---

## 9. Sự kiện cốt lõi (Events)

Backend áp dụng **Event-Driven Architecture** thông qua Spring Application Events để decoupling logic nghiệp vụ và logic IoT.

*   `GateCommandEvent`: Chứa thông tin cổng và lệnh.
*   `SystemEmergencyEvent`: Chứa cờ báo khẩn cấp và ID tòa nhà.
*   `StudentCheckedOutEvent`: Báo hiệu một sinh viên vừa rời KTX, cần cập nhật whitelist.
*   `StudentRfidAssignedEvent`: Báo hiệu một sinh viên vừa được cấp thẻ, cần cập nhật whitelist.

**Lưu ý kỹ thuật:** Tất cả các Listener trong `SmartAccessMqttListener` đều dùng `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`. Nghĩa là lệnh MQTT chỉ thực sự được gửi đi sau khi dữ liệu lịch sử/nhật ký đã lưu thành công vào Database. Điều này ngăn chặn việc "cửa đã mở nhưng Database bị rollback".

---

## 10. ESP32 Integration Readiness

**Đánh giá mức độ sẵn sàng:** Đủ điều kiện để kết nối một chiều (Backend ra lệnh -> ESP32 thực thi).

**Các điểm thiếu hụt (Gaps) cần lưu ý khi lập trình C++ cho ESP32:**
1.  **Không có MQTT ACK:** Backend bắn lệnh ra đi và tin rằng ESP32 nhận được (Fire and Forget). Backend không có logic Subscribe để lắng nghe thông báo "Đã mở cửa thành công" từ ESP32 qua MQTT. 
2.  **Không có Heartbeat/Device Status:** Hiện tại Backend chưa có bảng lưu trạng thái Online/Offline của thiết bị ESP32 (ping pong).
3.  **Bất đồng bộ (Lai REST & MQTT):** ESP32 phải code cả thư viện `HTTPClient` để gửi ảnh khuôn mặt lên `POST /api/v1/smartaccess/verify/face` (Synchronous HTTP) VÀ thư viện `PubSubClient` để lắng nghe lệnh mở cửa từ `MQTT` (Asynchronous).

---

## 11. Hướng dẫn kiểm thử bằng MQTT Explorer

Bạn có thể giả lập thiết bị ESP32 hoàn toàn trên máy tính mà không cần có mạch thực tế:

1.  **Cài đặt & Khởi động MQTT Broker:** Chạy Mosquitto (port 1883).
2.  **Giả lập thiết bị (MQTT Explorer):**
    *   Mở MQTT Explorer, kết nối vào `localhost:1883`.
    *   Thêm Topic vào ô Subscribe: `sdms/gates/#`
3.  **Kích hoạt luồng (Postman / Swagger):**
    *   Chạy Backend Spring Boot.
    *   Gọi API: `POST http://localhost:8080/api/v1/access/gates/G123/unlock` (Kèm Token Admin hợp lệ).
4.  **Kết quả mong đợi:** 
    *   API trả về `204 No Content`.
    *   Tại màn hình MQTT Explorer, một message lập tức xuất hiện tại topic `sdms/gates/G123/command` với nội dung `{"command":"UNLOCK",...}`.

---

## 12. Architecture Review

**Ưu điểm:**
*   Tuân thủ tốt **Clean Architecture / Hexagonal Architecture**: Mã nguồn nghiệp vụ (`RemoteUnlockService`) không hề biết đến sự tồn tại của thư viện Eclipse Paho. Nó chỉ quăng ra một `GateCommandEvent`. Phần tích hợp hạ tầng (`MqttListener`, `MqttGateway`) sẽ lo việc chuyển giao thức.
*   An toàn dữ liệu nhờ `@TransactionalEventListener(AFTER_COMMIT)`.
*   Giảm tải cho MQTT Broker vì luồng nhận diện ảnh nặng nề được thực hiện qua REST API thay vì ép MQTT chở file nhị phân lớn.

**Nhược điểm / Technical Debt:**
*   Sự thiếu vắng luồng nhận tín hiệu từ thiết bị (Inbound MQTT) làm cho Backend "bị mù" về trạng thái thật của cánh cửa (cửa có bị kẹt không, có mở thật không).
*   Chưa có Security (Username/Password, SSL/TLS) rõ ràng trên cấu hình mặc định (dễ bị nghe lén payload nếu chạy public broker).

**Khuyến nghị cho nhóm IoT (ESP32):**
*   Thiết kế mạch ESP32 tập trung xử lý REST API để xác thực và tải whitelist. Dùng luồng MQTT chỉ như một "kênh Wake-up" hoặc kênh nhận lệnh Override từ Admin.
