# TÀI LIỆU API & LUỒNG NGHIỆP VỤ: LỊCH SỬ RA VÀO (STUDENT APP)

> **THÔNG TIN QUẢN TRỊ (GOVERNANCE):**
> - **Cấp độ:** API Specification & Business Flow.
> - **Vị trí lưu trữ:** `docs/api/student_app_history_flow.md` (Tuân thủ luật API Centralization).
> - **Đối tượng:** Đội ngũ phát triển Mobile App / Web App dành cho Sinh viên.

---

## 1. LUỒNG NGHIỆP VỤ (BUSINESS FLOW)
Mục tiêu của App là cung cấp **Unified Timeline (Dòng thời gian hợp nhất)** giúp sinh viên tự giải đáp câu hỏi: *"Tại sao cửa không mở?"*.

**Thuật toán hợp nhất (O(N)):**
1. App gọi đồng thời 2 API: API Verification (Chỉ có log AI) và API Access (Chỉ có log Cửa).
2. Gom nhóm các sự kiện có `timestamp` lệch nhau dưới `5 giây` thành 1 Cụm sự kiện (Event Cluster).
3. **Quy tắc hiển thị (UI Rendering Rule):**
   - **TH1:** Nếu Cụm có cả `Verification = SUCCESS` và `Access = GRANTED` 🟢 -> Hiển thị "Vào ra thành công".
   - **TH2:** Nếu Cụm có `Verification = SUCCESS` nhưng `Access = DENIED` 🔴 -> Hiển thị "Từ chối: [Lý do từ Backend]".
   - **TH3:** Nếu Cụm CHỈ CÓ `Verification = FAIL` 🟡 -> Hiển thị "AI không nhận diện được khuôn mặt. Vui lòng thử lại".

---

## 2. API ENDPOINTS (DỰA TRÊN BACKEND THỰC TẾ)

Tất cả API dưới đây đều yêu cầu Header: `Authorization: Bearer <JWT_TOKEN>`

### 2.1. API Lấy Lịch sử Xác thực (Verification)
- **Endpoint:** `GET /api/v1/students/me/face/verifications`
- **Params:** `page` (int, default: 0), `size` (int, default: 15).
- **Mô tả:** Lấy danh sách các lần sinh viên đưa mặt vào camera.
- **Response Format:**
```json
{
  "content": [
    {
      "attemptId": "uuid",
      "gateDeviceId": "123e4567-e89b...",
      "status": "SUCCESS", // Hoặc "FAIL"
      "confidenceScore": 0.85,
      "attemptedAt": "2026-07-08T10:45:00Z"
    }
  ],
  "totalElements": 50
}
```

### 2.2. API Lấy Lịch sử Mở cửa (Access History)
- **Endpoint:** `GET /api/v1/access/history/me`
- **Params:** `page` (int, default: 0), `size` (int, default: 15).
- **Mô tả:** Lấy danh sách các lần hệ thống quyết định mở/đóng cửa cho sinh viên này.
- **Response Format:**
```json
{
  "content": [
    {
      "historyId": "uuid",
      "studentId": "uuid",
      "gateId": "123e4567-e89b...",
      "buildingId": "B1",
      "eventTimestamp": "2026-07-08T10:45:01Z",
      "decision": "DENIED", // Hoặc "GRANTED"
      "denialReason": "CURFEW_VIOLATION", // NULL nếu GRANTED
      "method": "FACE_AI"
    }
  ]
}
```

---

## 3. CÁC QUY TẮC TỐI ƯU UI/UX & CHỐNG CRASH CHO APP

### 3.1. Kỹ thuật chống Crash (Anti-Crash)
1. **Null Safety Bắt buộc:** Thuộc tính `denialReason` có thể là `null`. App bắt buộc phải dùng toán tử `??` để tránh Null Pointer Exception (NPE).
   ```dart
   // Dart/Flutter example
   Text(accessLog.denialReason ?? "Không xác định")
   ```
2. **Error Boundary & Timeout:** Nếu Backend bảo trì, API trả về 500 hoặc Timeout, bắt buộc Catch Error và hiển thị Lottie Animation / Fallback UI thay vì văng App (Crash to Desktop).
3. **Phân trang (Pagination) chặt chẽ:** Cấm gọi API không có param `size`. Mặc định gọi 15 records. Dùng `IntersectionObserver` hoặc `ScrollController` để fetch trang tiếp theo.

### 3.2. Cải thiện UX (Trải nghiệm)
- **Mapping Mã Lỗi sang Tiếng Việt:** 
  - `CURFEW_VIOLATION` -> "Vi phạm giờ giới nghiêm (Quá 23:00)".
  - `OUTSIDE_TIME_WINDOW` -> "Chưa đến khung giờ được phép ra vào".
  - `UNAUTHORIZED_OR_INACTIVE` -> "Tài khoản bị đình chỉ hoặc chưa kích hoạt".
- **Gợi ý Hành động (Call-to-Action):** Nếu sinh viên thấy lỗi "CURFEW_VIOLATION", App có thể hiển thị thêm nút *"Gửi yêu cầu xin mở cửa khẩn cấp"* để liên lạc với bảo vệ.
