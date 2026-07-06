# BÁO CÁO AUDIT HỆ THỐNG SMART ACCESS & FACE RECOGNITION (SDMS)

*Ngày lập báo cáo: 02/07/2026*
*Vai trò thực hiện: Principal Solution Architect & Tech Lead*

---

## 1. Tổng quan hệ thống
Kiến trúc tổng thể của hệ thống bao gồm sự kết hợp giữa thiết bị IoT (ESP32-CAM), AI (Kotlin) và Backend (Spring Boot). Tuy nhiên, sau khi quét toàn bộ kho lưu trữ mã nguồn hiện tại, tôi nhận thấy **chỉ có Backend (Spring Boot)** được triển khai một phần. Các component quan trọng như App Kotlin (AI), ESP32-CAM (Firmware), Gateway, MQTT Broker hoàn toàn vắng mặt trong repo này. Hệ thống Backend hiện tại đóng vai trò xử lý Business Rule, nhưng bị đứt gãy luồng kết nối IoT (không thể điều khiển mở cửa thực tế).

---

## 2. Thành phần đã hoàn thiện (DONE)
Dựa trên mã nguồn Spring Boot, các thành phần sau đã được triển khai hoàn thiện về mặt Core Business Logic:

- **Face Module (Data & Logic)**:
  - Các Entity cốt lõi: `FaceProfile`, `FaceEmbedding`, `FaceVerificationAttempt`.
  - Quản lý phiên bản khuôn mặt (`FaceProfileService`).

- **Smart Access (Business Rules)**:
  - Đánh giá quyền truy cập dựa trên Time Window & Curfew Policy (`AccessEvaluationService`, `TimeWindowEvaluationStrategy`, `CurfewResolutionStrategy`).
  - Xử lý Idempotency chống trùng lặp sự kiện (`IdempotencyService`).
  - Ghi nhận lịch sử vào/ra qua `AccessHistoryRepository`.

- **Integration**:
  - Observer Pattern: `IdentityVerifiedEventListener` kết nối rời rạc giữa Face Module và SmartAccess, đảm bảo tính Decoupling.

---

## 3. Thành phần đang dở (PARTIAL)
- **Face Recognition API**: API đã có, cấu trúc orchestration (`FaceAiOrchestrator`) đã có, nhưng port AI (`AiExtractionPort` -> `RestAiExtractionAdapter`) đang bị **Mock dữ liệu**. 
  - *Chi tiết*: Trả về một Mock Vector 192-dimension ngẫu nhiên do *"AI Engine sidecar is pending deployment"*.
- **Remote Unlock**: `RemoteUnlockService` đã được code, vượt qua Curfew Rules và lưu vào bảng `AccessHistory`. Tuy nhiên, dòng code cuối cùng chỉ là comment `// Publish event to trigger IoT module`. Không có sự kiện MQTT nào được gửi xuống phần cứng.
- **Smart Access Evaluation**: Hàm `evaluateAccess()` xử lý logic xong chỉ ghi log vào Database, hoàn toàn thiếu việc Publish MQTT message để relay mở cửa.

---

## 4. Thành phần chưa có (MISSING)
Hệ thống đang thiếu nghiêm trọng các khối nền tảng cho IoT và AI thực tế:
- Không có bất kỳ file `.kt`, `.ino`, `.cpp` nào trong dự án (Missing AI App & Firmware).
- Hoàn toàn vắng bóng cấu trúc cấu hình MQTT (Publisher/Subscriber/QoS).
- Không có module IoT/Device để quản lý trạng thái các mạch ESP32 và Camera.

---

## 5. Sai kiến trúc
- **Trách nhiệm AI không rõ ràng**: Tài liệu có đề cập "AI viết bằng Kotlin" nhưng Adapter của Backend lại comment gọi đến "External Python AI service". Hơn nữa, việc đẩy tính toán AI xuống Edge (App Kotlin) hay gom lên Server (Python/Backend) chưa được chốt dứt điểm. Nếu App Kotlin làm AI, thì Backend không cần `AiExtractionAdapter` gọi REST API nữa, mà App Kotlin phải tự gửi kết quả nhận diện kèm Event lên Backend.
- **Micro-services / Gateway**: Thiếu Gateway (API Gateway / IoT Gateway) dẫn đến Backend Spring Boot đang ôm đồm quá nhiều việc, từ Core API REST cho đến dự kiến giao tiếp trực tiếp với thiết bị phần cứng.

---

## 6. Thiếu Business Rule
- **Các luồng cực đoan (Edge cases)**: Không có logic xử lý khi cửa bị giữ mở quá lâu (Door Held Open), cửa bị phá (Forced Entry).
- **Đồng bộ Offline**: Không có rule để xử lý khi ESP32 mất mạng nhưng vẫn phải cho sinh viên quẹt thẻ/khuôn mặt offline.
- **Anti-Spam**: Không có cơ chế giới hạn tần suất quẹt thẻ/mặt liên tục.

---

## 7. Thiếu API
Mặc dù API cho Face đã có, nhưng chúng ta vẫn thiếu:
- **Device API**: Đăng ký ESP32, Cập nhật IP/Mac address, Heartbeat status.
- **Door API**: Thiết lập quan hệ mapping giữa Camera ID <-> Door ID <-> Relay ID.
- **Command API**: Retry Command, Force Lock, Emergency Open (Mở toàn bộ cửa khi có báo cháy).

---

## 8. Thiếu Database
Phần cốt lõi của SmartAccess mới chỉ có `AccessHistory`, `CurfewPolicy`. Hoàn toàn thiếu các bảng vật lý:
- `Device` (Lưu thông tin ESP32-CAM)
- `Door` (Lưu thông tin cửa vật lý)
- `Camera` (Liên kết Camera với Cửa)
- `DoorCommand` / `DoorCommandHistory` (Lưu trạng thái lệnh gửi xuống thiết bị)
- `DeviceHeartbeat` (Kiểm tra Online/Offline)

---

## 9. Thiếu Security
- **Device Authentication**: ESP32-CAM gọi lên Backend không có xác thực (ví dụ thiếu x509 certificate hoặc MQTT Username/Password).
- **Face Spoofing (Liveness Detection)**: Đang thiếu cơ chế chống dùng ảnh in, màn hình điện thoại (Fake image) để đánh lừa Camera.
- **Replay Attack**: MQTT/REST Payload từ thiết bị chưa có Timestamp, Nonce hoặc HMAC. Kẻ gian có thể capture gói tin "Unlock" và replay lại.
- **Data in transit**: Mất kiểm soát TLS/SSL cho luồng IoT.

---

## 10. Thiếu IoT
- **ESP32 Firmware**: Chưa có mã nguồn C++/Arduino điều khiển Capture Image, MQTT Client, GPIO Relay.
- **Heartbeat & Health Check**: Không biết được Camera nào đang hỏng, cửa nào đang kẹt.
- **Offline Queue**: Không có hàng đợi lệnh. Ví dụ: Lệnh mở cửa từ xa gửi xuống nhưng rớt mạng, lúc có mạng lại thì cửa có tự mở không? Cần cơ chế QoS và TTL cho MQTT.

---

## 11. Thiếu AI
- **Mã nguồn AI**: Kotlin AI không tồn tại trong repo hiện hành.
- **Face Registration**: Backend mới có cấu trúc lưu vector, nhưng chưa có luồng Crop/Cắt mặt/Extract Embedding thực tế.
- **Face Evolution**: Thiếu chức năng tự động cập nhật độ chính xác khi đặc điểm khuôn mặt của sinh viên thay đổi qua các năm.

---

## 12. Thiếu Gateway
- Dự án **CHƯA CÓ GATEWAY**.
- **Mức độ ảnh hưởng**: Trung bình đến Cao.
- **Đánh giá**: Mặc dù không bắt buộc phải có API Gateway (như Kong/Traefik) nếu chỉ là Monolithic Spring Boot, nhưng **RẤT CẦN một IoT Gateway (Edge node)** nếu có hàng ngàn ESP32-CAM. Việc đẩy thẳng luồng ảnh/stream từ hàng ngàn sinh viên lên thẳng Server sẽ làm quá tải hệ thống. IoT Gateway ở tòa nhà sẽ làm nhiệm vụ gom gói tin MQTT, Cache Rule, và xử lý Face Recognition sơ bộ.

---

## 13. Thiếu MQTT
Toàn bộ phần giao tiếp thiết bị đang là khoảng trống.
- Chưa có MQTT Broker (Mosquitto/EMQX).
- Thiếu định nghĩa Topic Design (Ví dụ: `sdms/buildingA/door1/unlock`).
- Chưa cấu hình Spring Integration MQTT (Publish/Subscribe).
- Thiếu thiết kế Quality of Service (Ít nhất phải dùng QoS 1 cho các lệnh đóng mở cửa).

---

## 14. Thiếu Audit
Hệ thống log `AccessHistory` khá tốt khi lưu lại được `denialReason`. Tuy nhiên, bảng Audit toàn cục (System Log) còn thiếu việc tracking:
- Sự kiện vè cửa: `DOOR_FORCED_OPEN`, `DOOR_HELD_OPEN`.
- Trạng thái thiết bị: `DEVICE_ONLINE`, `DEVICE_OFFLINE`.
- Lịch sử vận hành: `REMOTE_UNLOCK` (Chưa có hệ thống Audit Trail truy xuất độc lập chống chối bỏ việc ai là người nhấn nút mở từ xa).

---

## 15. Khả năng mở rộng (Scalability cho RFID/Fingerprint)
**ĐÁNH GIÁ: CỰC KỲ TỐT.**
Kiến trúc SmartAccess trong mã nguồn hiện tại được thiết kế theo hướng **Domain-Driven Design (DDD)** và rất mở:
- Entity `AccessHistory` đã định nghĩa field `method` (Type: `VerificationMethod`).
- Các hàm của `AccessEvaluationService` không bị trói buộc với Face ID. Nó nhận vào thông tin `studentId`, `gateId` và `method`.
- Vì vậy, sau này nếu thêm RFID, Vân tay hay QR Code, hệ thống chỉ cần tạo ra các Listener mới (vd: `RfidScannedEventListener`), gọi vào hàm `evaluateAccess` và truyền thêm `VerificationMethod.RFID`. Toàn bộ rules (Curfew, TimeWindow) vẫn sẽ được tái sử dụng 100%.

---

## KẾT LUẬN & MỨC ĐỘ SẴN SÀNG (%)
| Hạng mục | Độ hoàn thiện | Ghi chú |
| :--- | :---: | :--- |
| **Backend Business Logic** | 80% | Kiến trúc sạch, OOP và Design Pattern tốt. Đã có đủ rule. |
| **API & Database IoT** | 10% | Chỉ có log Access, thiếu toàn bộ Device/Door/Command Entities. |
| **MQTT Integration** | 0% | Chưa có broker và cơ chế pub/sub. |
| **AI (Face Engine)** | 10% | Đang mock vector 192, chưa tích hợp Engine thực. |
| **ESP32 Firmware** | 0% | Mã nguồn trống. |
| **Security & Auditing** | 30% | Auth REST tốt nhưng Security cho IoT là Zero. |
| **TỔNG THỂ DỰ ÁN** | **~25%** | **Sẵn sàng Demo Mockup. Chưa thể chạy thiết bị phần cứng.** |

**Lời khuyên của Architect:** Khoan tối ưu hay thêm tính năng REST mới. Nhiệm vụ cấp bách nhất bây giờ là **Dựng Database cho Device/Door**, **Setup MQTT Broker** và **Viết ESP32 Firmware** để đả thông luồng End-to-End từ Hardware chạy lên Backend và ngược lại.
