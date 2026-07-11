# Tính năng: Điều chuyển phòng khẩn cấp & Tự động đồng bộ IoT Thẻ từ
**Trạng thái:** Kế hoạch tương lai (Future Roadmap)
**Mã tính năng:** FEAT-001

## 1. Tầm nhìn (Vision)
Trong thực tế vận hành Ký túc xá, hạ tầng vật lý có thể gặp sự cố bất ngờ (như hỏng điện, dột nước) yêu cầu bảo trì khẩn cấp. Hệ thống hiện tại với Validator nghiêm ngặt không cho phép bảo trì phòng khi đang có sinh viên cư trú. 
Tính năng này ra đời nhằm cung cấp luồng "Sơ tán / Điều chuyển tạm thời" một cách trơn tru. Điểm nhấn luận văn của tính năng này là sự kết hợp với hệ thống IoT (ESP32/Cửa từ): Khi hệ thống phần mềm điều chuyển sinh viên sang phòng tạm, quyền truy cập thẻ từ vật lý của sinh viên sẽ lập tức được hệ thống IoT đồng bộ OTA (cấp quyền mở cửa phòng tạm và tước quyền mở cửa phòng hỏng) mà không cần thu hồi thẻ vật lý.

## 2. Luồng nghiệp vụ (Business Flow)
1. **Phát hiện sự cố:** Quản lý nhận được báo cáo hỏng hóc từ sinh viên/nhân viên và xác định cần bảo trì phòng.
2. **Tìm kiếm phòng tạm (Emergency Relocation):** Hệ thống gọi API `getEmergencyRelocationRooms()` để gợi ý các phòng còn giường trống phù hợp làm nơi ở tạm thời.
3. **Thực thi lệnh Điều chuyển (Relocation Action):** 
   - Quản lý chọn sinh viên từ phòng hỏng và gán sang phòng tạm.
   - Hệ thống Backend cập nhật lại bản ghi `StudentHousingAssignment` cho các sinh viên này sang `bedId` mới.
4. **Đồng bộ IoT (Event-Driven):** 
   - Backend phát ra sự kiện `HousingAssignmentChangedEvent`.
   - Module IoT lắng nghe và đẩy cấu hình mới xuống ESP32 qua giao thức MQTT/Socket.
   - Thẻ từ của sinh viên lập tức có tác dụng ở cửa phòng tạm, và mất tác dụng ở cửa phòng hỏng.
5. **Khóa phòng & Bảo trì:** Phòng hỏng giờ đã trống (occupancy = 0), Quản lý đổi trạng thái phòng thành `MAINTENANCE` để nhân viên kỹ thuật vào sửa chữa.
6. **Hoàn tất (Rollback):** Khi sửa xong, trạng thái phòng chuyển lại thành `AVAILABLE`, và luồng điều chuyển được thực hiện ngược lại để trả sinh viên về phòng cũ.

## 3. Lộ trình triển khai (Implementation Roadmap)

### 3.1. Phân hệ Backend (`sdms-backend`)
- [ ] Bổ sung API `POST /api/v1/admin/housing-assignments/relocate` trong `HousingAssignmentAdminController`.
- [ ] Cập nhật logic `HousingAssignmentService.relocateStudent(...)` với cơ chế Transaction an toàn (chống Race Condition).
- [ ] Xây dựng bộ Event Publisher (`ApplicationEventPublisher`) để bắn sự kiện `HousingAssignmentChangedEvent` khi lệnh điều chuyển thành công.

### 3.2. Phân hệ IoT Gateway (`sdms-iot-gateway`)
- [ ] Lắng nghe sự kiện từ Backend (thể hiện qua RabbitMQ, Kafka hoặc webhook/socket).
- [ ] Viết logic quản lý danh sách cấp quyền thẻ RFID (Whitelist Card IDs).
- [ ] Gửi payload cập nhật xuống phần cứng ESP32.

### 3.3. Phân hệ Web Admin (`sdms-frontend`)
- [ ] Thêm nút **"Điều chuyển khẩn cấp"** trong `BedDetailDrawer` của giao diện Quản lý Phòng.
- [ ] Xây dựng Modal (Dialog) hiển thị danh sách các phòng tạm (gọi API `getEmergencyRelocationRooms`).
- [ ] Gọi API `relocate` và hiển thị Toast thông báo trạng thái đồng bộ thẻ từ.

---

## 4. Trigger Prompt (Dùng cho AI Agent trong tương lai)
> *Khi User muốn thực hiện tính năng này, hãy copy/paste đoạn prompt sau vào cửa sổ chat:*

```text
Hãy thực hiện tính năng FEAT-001: Điều chuyển phòng khẩn cấp & Tự động đồng bộ IoT Thẻ từ dựa trên tài liệu docs/roadmap/features/001_EMERGENCY_ROOM_RELOCATION_AND_IOT_SYNC.md. 
Bắt đầu từ Backend: Tạo API Relocate và cài đặt hệ thống Event Listener. Đảm bảo tuân thủ tính nghiêm ngặt về Data Transaction. Sau đó báo cáo để tôi kiểm duyệt trước khi sang làm UI Frontend.
```
