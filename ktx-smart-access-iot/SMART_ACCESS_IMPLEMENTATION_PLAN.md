# SMART ACCESS IMPLEMENTATION PLAN

## 1. Current Project Status
- **Backend (Spring Boot):** READY. Business logic, documentation, API, MQTT, and Database are fully implemented and frozen.
- **IoT Repository:** READY. Documentation and repository structure are aligned and frozen. Hardware diagnostics (STEP01-04) have PASSED.
- **Python AI:** Developed by another team member, awaiting integration via Backend.
- **Android App:** Developed by another team member, awaiting integration.

## 2. Current Implementation Readiness
The project architecture strictly designates the Backend as the Single Source of Truth (SSOT) and orchestrator. The ESP32 acts solely as an Edge Device capturing data and executing commands. The IoT repository is currently devoid of business logic and duplicate documentation, standing perfectly clean and ready for the firmware implementation phase.

## 3. Demo Scope
The goal of this phase is to deliver a functional Graduation Project Demonstration. The implementation will strictly avoid over-engineering, commercial-grade features, or unnecessary complexities. Only features critical to proving the end-to-end functionality of the Smart Dormitory Access System will be built.

## 4. Features Required for the Demo
The firmware must support the following core flows:
- **Flow 1 - Remote Unlock:** Admin triggers unlock via Spring Boot -> MQTT -> ESP32 -> Relay -> Door Open.
- **Flow 2 - RFID Access:** RFID -> ESP32 -> Spring Boot -> Access Validation -> MQTT / Response -> Relay.
- **Flow 3 - Face Recognition:** Camera -> ESP32 -> Spring Boot -> Python AI -> Spring Boot -> MQTT Response -> Relay.
- **Flow 4 - Access History:** ESP32 -> Spring Boot -> Database -> Web Dashboard.
- **Flow 5 - Offline RFID:** Whitelist -> ESP32 -> Offline Access -> Sync when Online.

## 5. Features Intentionally Excluded
To maintain focus on the graduation demo, the following features are OUT OF SCOPE and will NOT be implemented:
- OTA Update (Over-the-Air)
- Device Provisioning & Dynamic Configuration Server
- Multi-Building & Multi-Tenant Support
- Metrics Dashboard & Advanced Monitoring
- Firmware Version Management
- Certificate Rotation & Secure Boot
- Remote Firmware Upgrade
- Cloud Fleet Management & Commercial Device Management
- Production Deployment

## 6. Firmware Modules Required
Based on the demo requirements, the following minimal C/C++ firmware modules are required:
- `Config`: Handles static WiFi, MQTT, API endpoints, and hardware configuration.
- `Network/WiFi`: Connects to the local network and handles basic reconnects.
- `Network/MQTT`: Subscribes to backend topics, handles incoming JSON payloads, and sends heartbeat.
- `Network/HTTP`: Executes `multipart/form-data` uploads for Face images.
- `Drivers/Camera`: Initializes OV2640 and captures JPEG frames.
- `Drivers/RFID`: Communicates with MFRC522 via SPI.
- `Drivers/Relay`: Manages GPIO states for the magnetic lock and indicators.
- `Storage/Cache`: Handles local SPIFFS/EEPROM for the offline RFID whitelist.
- `App/Core`: Orchestrates the flows (Idle -> Trigger -> Upload -> Actuate).

## 7. Configuration Specification
The `Config` module must centralize all static parameters. No business logic should be hardcoded. The following configuration properties must be present:
- `deviceId`: Định danh thiết bị.
- `gateId`: Định danh cổng mà thiết bị phụ trách.
- `buildingId`: Định danh tòa nhà.
- `backendBaseUrl`: URL gốc của Spring Boot Backend.
- `mqttBroker`: IP/Domain của MQTT Broker.
- `mqttPort`: Cổng của MQTT Broker (thường là 1883).
- `wifiSSID`: Tên mạng WiFi.
- `wifiPassword`: Mật khẩu WiFi.
- `relayPin`: Chân GPIO điều khiển Khóa từ.
- `cameraFrameSize`: Kích thước ảnh chụp (Khuyến nghị VGA/QVGA).
- `cameraQuality`: Chất lượng nén ảnh JPEG.
- `heartbeatInterval`: Khoảng thời gian gửi tín hiệu sống (Ping).
- `reconnectInterval`: Khoảng thời gian chờ trước khi thử kết nối lại mạng.
- `requestTimeout`: Thời gian tối đa chờ phản hồi HTTP.

## 8. Device Identity
Firmware phải có định danh duy nhất (Device Identity) để Backend quản lý thiết bị. Cấu trúc định danh bao gồm:
- **Device ID**
- **Gate ID**
- **Building ID**
- **Firmware Version**
- **Hardware Model** (ESP32-CAM)
- **MAC Address**

*(Lưu ý: Chỉ khai báo tĩnh hoặc sinh từ MAC Address, không thiết kế hệ thống Device Provisioning động phức tạp để tránh over-engineering).*

## 9. Firmware State Machine
Hệ thống phần mềm biên sẽ hoạt động theo luồng State Machine mức cao, tuyến tính và tinh gọn:

Boot 
↓ 
Load Configuration 
↓ 
Initialize Hardware (Camera, RFID, Relay) 
↓ 
Connect WiFi 
↓ 
Connect MQTT 
↓ 
Send Heartbeat 
↓ 
Idle (Chờ sự kiện) 
↓ 
Receive Event (Nút bấm / Quẹt thẻ / Nhận lệnh MQTT) 
↓ 
Execute Workflow (Gửi HTTP/MQTT hoặc Đóng ngắt Relay) 
↓ 
Report Result (Gửi trạng thái về Backend) 
↓ 
Return Idle

## 10. Heartbeat Strategy & Basic Error Recovery
### 10.1. Heartbeat Strategy
Firmware gửi Heartbeat định kỳ lên Backend thông qua MQTT. 
Heartbeat chỉ phục vụ:
- Kiểm tra Online Status.
- Device Monitoring cơ bản để đảm bảo thiết bị không bị treo.
*(Không thiết kế Dashboard hiển thị phức tạp hay Monitoring Platform mang tính chất Production).*

### 10.2. Basic Error Recovery
Chiến lược xử lý lỗi tối giản giúp mạch luôn duy trì trạng thái hoạt động:
- **WiFi Lost** ↓ Reconnect (Tự động kết nối lại theo chu kỳ `reconnectInterval`).
- **MQTT Lost** ↓ Reconnect.
- **HTTP Timeout** ↓ Retry (Gửi lại yêu cầu vài lần).
- **Camera Capture Failed** ↓ Retry.
- **RFID Read Failed** ↓ Retry.
*(Không xây dựng Error Framework, Circuit Breaker, hay các Production Pattern).*

## 11. Implementation Order
Thứ tự triển khai được cấu trúc để kiểm chứng từng tầng độc lập trước khi ráp nối, đảm bảo dễ debug và tránh conflict phần cứng:

Phase 0
↓
Configuration
↓
Device Identity
↓
Diagnostics Verification
↓
WiFi
↓
MQTT
↓
Heartbeat
↓
Relay
↓
Camera
↓
HTTP Upload
↓
RFID
↓
Offline Cache

*Lý do:* Thiết lập Network và giao tiếp (WiFi, MQTT, Identity) là móng nhà, tiếp đến Relay là thiết bị Output quan trọng nhất cho Demo, sau đó mới tích hợp Camera/RFID làm thiết bị Input, và cuối cùng mới là Fallback (Offline Cache).

## 12. Integration Points with Backend
- **REST API (POST):** `/api/v1/smartaccess/verify/face` (Multipart image).
- **REST API (POST):** `/api/v1/smartaccess/verify/card` (JSON RFID).
- **REST API (GET):** `/api/v1/smartaccess/rfid-whitelist`.
- **MQTT (Subscribe):** `sdms/gates/{gateId}/command`, `sdms/gates/building/{buildingId}/command`, `sdms/gates/system/broadcast`, `sdms/gates/system/whitelist`.

## 13. Dependencies on Python AI & Android App
- **Python AI:** The firmware has **NO direct dependency** on the Python AI. The ESP32 sends the image to the Spring Boot Backend. Spring Boot acts as a proxy/orchestrator.
- **Android App:** The firmware has **NO direct dependency** on the Android App. The Android App will communicate exclusively with the Spring Boot Backend. The Backend translates these requests into MQTT messages for the ESP32.

## 14. Definition of Done for the Firmware
The firmware phase is considered complete ONLY when:
- [x] Code compiles cleanly without critical warnings.
- [x] Architecture follows the modular design (Drivers, Network, Core).
- [x] ESP32 successfully triggers the Relay upon receiving MQTT commands.
- [x] ESP32 successfully captures and uploads an image to the Backend.
- [ ] ESP32 successfully reads an RFID tag and sends it to the Backend. *(Skipped for now: Hardware not available)*
- [ ] ESP32 successfully opens the door using local cache when WiFi is disconnected. *(Skipped for now: Hardware not available)*
- [x] No fake data, hardcoded business logic, or mocks exist in the codebase.
- [ ] The full end-to-end Graduation Demo (Flows 1 to 5) executes flawlessly. *(Waiting for AI & App)*
- [x] ✓ Configuration tập trung.
- [x] ✓ Device Identity hoạt động.
- [x] ✓ WiFi Auto Reconnect.
- [x] ✓ MQTT Auto Reconnect.
- [x] ✓ Heartbeat hoạt động.
- [x] ✓ Không duplicate Business Logic.
- [x] ✓ Không duplicate Backend Documentation.

## 15. Next Steps for the Next Working Session
To achieve a flawless 100% End-to-End Demo, the upcoming session will focus exclusively on:
1. **Python AI Engine Development:** Implement the face recognition engine (Flask/FastAPI) and integrate it with the Spring Boot Backend to process the `multipart/form-data` sent by the ESP32 (This will resolve the current HTTP 500 Error).
2. **Mobile App Development:** Build the management application interface to monitor the `Heartbeat` status and trigger the Remote `UNLOCK` MQTT command.
