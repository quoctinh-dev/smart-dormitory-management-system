# Tài liệu Nối mạch & Kiểm tra chéo (Cross-validation) Cửa Phòng (Room Door)

**Cập nhật:** 2026-07-15
**Đối tượng:** ESP32 DevKit V1 (30-Pin) - Room Door & Java Spring Boot Backend

## 1. Sơ đồ nối mạch (Wiring Diagram)
Dựa theo tài liệu tham chiếu đọc được từ `docs/devices/esp32-devkit-v1/README.md` và mã nguồn trong `Config.h`, sơ đồ nối dây cho ESP32 DevKit V1 (30-Pin) được thiết lập như sau:

### LCD1602 I2C
* **VCC** ────> VIN (5V)
* **GND** ────> GND
* **SDA** ────> GPIO21
* **SCL** ────> GPIO22

### Servo SG90
* **Signal (Cam/Vàng)** ────> GPIO13
* **VCC (Đỏ)** ──────────> 5V (Nguồn ngoài, không dùng nguồn 3.3V của ESP32 để tránh sụt áp)
* **GND (Đen/Nâu)** ─────> GND (Nối chung với GND của ESP32)

### Bàn phím Ma trận (Matrix Keypad 4x4)
* **Row 1** ────> GPIO14
* **Row 2** ────> GPIO27
* **Row 3** ────> GPIO26
* **Row 4** ────> GPIO25
* **Col 1** ────> GPIO33
* **Col 2** ────> GPIO32
* **Col 3** ────> GPIO4
* **Col 4** ────> GPIO16

> ⚠️ *Lưu ý:* Điện áp hoạt động của logic ESP32 là 3.3V. Không cấp 5V trực tiếp vào các chân GPIO. Các chân GPIO34, 35, 36, 39 là Input-only nên không được dùng cho Keypad Col (cần Output). Sơ đồ trên đã tuân thủ chuẩn này.

## 2. Kiểm tra chéo (Cross-Validation) Firmware và Backend

Quá trình kiểm tra chéo được thực hiện **chuyên sâu (deep check)** bằng cách đối chiếu trực tiếp mã nguồn của firmware (`NetworkManager.h`) và mã nguồn backend (`IotVerificationController.java`).

### 2.1 API Endpoint và Payload (Request)
* **Firmware (`NetworkManager.h`):** ESP32 thực hiện gọi HTTP POST đến endpoint `BACKEND_BASE_URL + "/verify/pin"`. Payload JSON gửi đi được thiết lập như sau:
  ```cpp
  StaticJsonDocument<200> doc;
  doc["pinCode"] = pinCode;
  doc["gateId"] = GATE_ID;
  ```
* **Backend (`IotVerificationController.java`):** Controller nhận yêu cầu tại endpoint `@PostMapping("/verify/pin")` thông qua map dữ liệu:
  ```java
  public ApiResponse<Map<String, String>> verifyPin(@RequestBody Map<String, String> payload) {
      String pinCode = payload.get("pinCode");
      String gateIdStr = payload.get("gateId");
      // ...
  }
  ```
=> **Kết luận:** Request HTTP URL và Request Payload khớp nhau 100% (cùng key `pinCode` và `gateId`).

### 2.2 Định dạng Phản hồi (Response Envelope)
* **Firmware (`NetworkManager.h`):** Firmware kỳ vọng cấu trúc JSON có trường `success`, sau đó đọc tiếp `data.status`:
  ```cpp
  if (!error && responseDoc["success"] == true) {
      String status = responseDoc["data"]["status"];
      if (status == "GRANTED") {
          lcdPrintMessage("ACCESS GRANTED", "WELCOME!");
          openDoor();
      }
      // ...
  }
  ```
* **Backend (`IotVerificationController.java`):** Backend chuẩn hóa định dạng trả về bằng `ApiResponse<T>`:
  * Trường hợp **GRANTED** (Đúng mã PIN, được phép mở): 
    ```java
    return ApiResponse.success("Xác thực mã PIN thành công...", Map.of("status", "GRANTED", "studentId", studentId.toString()));
    ```
    *(Tương đương JSON: `{ "success": true, "data": { "status": "GRANTED", ... } }`)*
  * Trường hợp **DENIED** (Sai mã hoặc không có quyền):
    ```java
    return new ApiResponse<>(false, "Mã PIN sai...", Map.of("status", "DENIED"), "IOT_PIN_NOT_FOUND");
    ```
    *(Tương đương JSON: `{ "success": false, "data": { "status": "DENIED" }, "errorCode": "IOT_PIN_NOT_FOUND" }`)*

=> **Kết luận:** Cấu trúc Response tuân thủ chặt chẽ `API RESPONSE ENVELOPE PATTERN RULE` được định nghĩa trong `sdms-iot-gateway/.agents/AGENTS.md`. Firmware ESP32 trích xuất các trường `success` và `status` rất chính xác để xử lý mở cửa.

## 3. Bằng chứng kiểm tra mã nguồn (Proof of Verification)
Tôi cam kết đã trực tiếp đọc nội dung mã nguồn thay vì dự đoán, tuân thủ nguyên tắc `Code is Truth` & `No Guessing/No Memory Reliance`. Dưới đây là bằng chứng (Proof of read):
- Đã đọc sơ đồ GPIO và tham số tại: `sdms-iot-gateway/firmware_esp32/room_door/Config.h` (Dòng 32-48).
- Đã đọc chi tiết hàm `verifyPinWithBackend` tại: `sdms-iot-gateway/firmware_esp32/room_door/NetworkManager.h` (Dòng 52-114).
- Đã search và đọc chính xác API Backend xử lý PIN tại: `sdms-backend/src/main/java/.../IotVerificationController.java` (Từ dòng 146 đến 196).
- Đã xem lại tài liệu phần cứng chuẩn tại `sdms-iot-gateway/docs/devices/esp32-devkit-v1/README.md`.

**Đánh giá tổng quan nghiệp vụ:** MỌI THỨ ĐÃ OK ✅. Kết nối giữa Backend và Cửa Phòng (Room Door) đã đồng bộ hoàn toàn. Không phát hiện sai sót nào ở cả định dạng dữ liệu lẫn luồng giao tiếp mạng.
