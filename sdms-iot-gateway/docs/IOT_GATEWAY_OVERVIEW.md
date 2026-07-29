# 📊 Báo Cáo Tổng Quan Phân Hệ IoT Gateway (`sdms-iot-gateway`)

Dựa trên việc phân tích thư mục và tài liệu cấu hình `AGENTS.md`, dưới đây là báo cáo tổng quan về kiến trúc, vai trò và quy trình phát triển đối với phân hệ phần cứng (IoT Gateway) của dự án **Smart Dormitory Management System (SDMS)**.

## 1. 🎯 Vai Trò Của Phân Hệ IoT (Edge Device)
Theo định hướng của kiến trúc hệ thống (tại `README.md`), IoT Gateway đóng vai trò là **Edge Device** (Thiết bị vùng biên).
* **Nhiệm vụ chính:** Quản lý phần cứng (Camera, đầu đọc RFID, Relay, nút bấm), duy trì kết nối mạng (WiFi, MQTT) và thực thi các lệnh điều khiển vật lý (đóng/mở cửa).
* **Luồng giao tiếp:**
  * **Với Backend:** IoT gửi dữ liệu thô (như hình ảnh camera, mã thẻ RFID) lên Backend. Backend sẽ xử lý nghiệp vụ, lưu cơ sở dữ liệu và quyết định gửi lệnh điều khiển (Actuator) xuống lại IoT qua giao thức MQTT.
  * **Với Frontend / Mobile App:** IoT **KHÔNG** giao tiếp trực tiếp với người dùng qua web hay app. Mọi tương tác đều đi qua cầu nối Backend.
  * **Với AI Module:** Tương tự, IoT không nói chuyện trực tiếp với AI. Việc xử lý nhận diện khuôn mặt được Backend điều phối.

## 2. 📂 Cấu Trúc Mã Nguồn & Thư Mục
Phân hệ `sdms-iot-gateway` được tổ chức rất rõ ràng, tách bạch giữa tài liệu, mã nguồn và công cụ kiểm thử:

* `firmware_esp32/`: Thư mục chứa mã nguồn C/C++ cho các vi điều khiển ESP32. Hiện tại hệ thống đang chia thành các cụm thiết bị:
  * `smart_access/`: Firmware cho hệ thống kiểm soát ra vào chính (cổng chính KTX).
  * `room_door/`: Firmware cho hệ thống khóa cửa từng phòng (Sử dụng Keypad, thẻ từ, khóa cửa Servo).
  * `diagnostics/`: Chứa các đoạn code nhỏ dùng để test nhanh từng linh kiện phần cứng độc lập.
* `docs/`: Chứa toàn bộ đặc tả hệ thống của IoT.
  * `ESP32_INTEGRATION_SPECIFICATION.md`: Hợp đồng kết nối (Contract) sống còn giữa ESP32 và Backend (MQTT/HTTP).
  * `E2E_OFFLINE_SYNC_TESTING.md`: Đặc tả về tính năng lưu lịch sử quẹt thẻ offline và đồng bộ lên server khi có mạng.
  * Các thư mục con như `hardware/` (sơ đồ chân cắm) và `network/` (cấu hình mạng giả lập bảo mật).
* `.agents/AGENTS.md`: Bộ quy tắc Workflow tối cao dành cho AI khi lập trình trên phân hệ này.

## 3. ⚖️ Quy Tắc Khắt Khe Trong Quá Trình Lập Trình (AI Workflow)
Tài liệu `AGENTS.md` áp đặt những luật lệ cực kỳ nghiêm ngặt đối với quá trình code Firmware:

1. **Bắt buộc tham chiếu (Single Source of Truth):** Trước khi sửa bất kỳ dòng code nào, phải đọc đặc tả từ Backend (`sdms-backend/docs/smartaccess/`) để hiểu rõ luồng nghiệp vụ.
2. **Kiểm chứng thực tế (Code is Truth):** Không bao giờ đoán mò tài liệu. Mọi sửa đổi phải dựa trên việc đọc trực tiếp file `.cpp` và `.h` hiện tại.
3. **Chuẩn API Envelope (ApiResponse<T>):** 
   * Vi điều khiển khi phân tích (parsing) chuỗi JSON trả về từ HTTP hoặc MQTT bắt buộc phải tuân theo cấu trúc bao bọc chuẩn của hệ thống: `{ "success": ..., "errorCode": ..., "data": ... }`.
   * Luôn phải kiểm tra `success` trước khi đọc cấu trúc `data`.
4. **Build & Test (Luật Self-Verification):** Sau khi viết code xong, bắt buộc phải chạy lệnh biên dịch (`pio run` hoặc tương đương) để chứng minh code C++ không bị lỗi cú pháp trước khi báo cáo hoàn thành.
5. **Giới hạn trách nhiệm (Boundary Scope):** Tất cả tài liệu liên quan đến mạch điện và firmware chỉ được nằm gọn trong thư mục `sdms-iot-gateway/docs/`. Không được lưu trữ nhầm lẫn sang Backend.

## 4. 🚀 Đề Xuất Bước Tiếp Theo
Hệ thống đã có bộ khung tốt để tiến hành phát triển tính năng phần cứng. Nếu chúng ta bắt đầu lập trình, quy trình chuẩn sẽ là:
1. Xác định thiết bị cần làm: Khóa cổng chính (`smart_access`) hay khóa cửa phòng (`room_door`).
2. Xem lại tài liệu Mapping & Integration trong `docs/`.
3. Viết code C/C++ xử lý ngắt, đọc cảm biến và gửi gói tin JSON đúng chuẩn.
4. Chạy biên dịch kiểm tra.
