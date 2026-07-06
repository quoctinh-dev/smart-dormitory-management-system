# Kiến trúc Tích hợp: ESP32-CAM - Spring Boot - Python AI

## 1. Tổng quan Kiến trúc (Backend-Centric AI)
Tài liệu này ghi nhận lại chuẩn giao tiếp và kiến trúc nhằm đảm bảo phía Spring Boot Backend và Python AI Microservice không bị lệch hướng trong quá trình phát triển độc lập.

- **ESP32-CAM (IoT)**: Đóng vai trò Client, nhận tín hiệu (PIR/Nút nhấn), chụp ảnh và gửi ảnh thẳng lên Spring Boot.
- **Spring Boot (Core)**: Đóng vai trò Orchestrator. Nhận ảnh từ ESP32, chuyển ảnh cho Python AI, nhận về Vector khuôn mặt, tính toán khoảng cách Euclidean, kiểm tra quyền truy cập (Curfew, Time Window), lưu Access History và trả kết quả mở cửa cho ESP32.
- **Python AI (FastAPI)**: Đóng vai trò Microservice. Nhận ảnh từ Spring Boot, tiền xử lý và chạy mô hình TensorFlow Lite/FaceNet để trả về mảng Vector 192 chiều.

## 2. API Contract 1: Python AI Microservice (Vỹ phụ trách)
Đây là API mà Spring Boot sẽ gọi sang để lấy Vector. Phía Python cam kết phải giữ đúng định dạng này.

- **Endpoint:** `POST /api/v1/faces/extract`
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file`: (Kiểu File) Ảnh chụp khuôn mặt.
- **Response (JSON) - Thành công:**
  ```json
  {
      "success": true,
      "message": "Extraction successful",
      "data": {
          "vector": [0.015, -0.023, 0.884] // Mảng Float 192 chiều
      }
  }
  ```
- **Response (JSON) - Thất bại (Không có mặt, mờ, lỗi...):**
  ```json
  {
      "success": false,
      "message": "No face detected",
      "data": null
  }
  ```

## 3. Định hướng triển khai Spring Boot (Tịnh phụ trách)
Phía Backend cần thực hiện 2 nhiệm vụ chính bám sát kiến trúc này:

### 3.1. Cập nhật `RestAiExtractionAdapter.java`
- **Nhiệm vụ:** Viết logic gọi HTTP POST sang `Python AI Microservice`.
- **Thực thi:** Sử dụng `RestTemplate` hoặc `WebClient` tạo request `multipart/form-data` chứa file ảnh, gọi sang endpoint `/api/v1/faces/extract` và map response về mảng `float[]`.

### 3.2. API Giao tiếp trực tiếp với mạch ESP32 (Đã hoàn thiện)
- **Endpoint (Thực tế đã code):** `POST /api/v1/smartaccess/verify/face`
- **Request (multipart/form-data):**
  - `file`: (Kiểu File) Ảnh chụp khuôn mặt gửi từ mạch.
  - `gateId`: (String) Mã định danh UUID của cái cổng KTX.
- **Response (JSON):**
  - **Hợp lệ (Mở cửa):** `{"status": "GRANTED", "message": "Face match and policy allowed", "profileId": "...", "confidence": 0.99}`
  - **Bị cấm (Quá giờ giới nghiêm):** `{"status": "DENIED", "message": "Face matched but access denied by policy"}`
  - **Không nhận diện được:** `{"status": "DENIED", "message": "Face not recognized"}`
  - **Lỗi AI sập:** `{"status": "ERROR", "message": "AI Engine Down or Internal Error"}`
- **Luồng xử lý (Workflow):** Spring Boot tự động nhận ảnh -> Gọi sang Python lấy vector -> Quét DB pgvector -> Kiểm tra giờ giới nghiêm -> Trả kết quả JSON về ngay lập tức cho ESP32.
