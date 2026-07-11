# IOT DOMAIN MASTER DATA & TÀI LIỆU CHÍNH SÁCH XÁC THỰC

> **THÔNG TIN QUẢN TRỊ (GOVERNANCE):** 
> - **Cấp độ Tài liệu:** Business Documentation / Domain Model.
> - **Justification (Lý do đặt file ở đây):** Tuân thủ luật `DOCUMENT PLACEMENT & JUSTIFICATION RULE`. Tài liệu này mô tả Dữ liệu nền, Chính sách nghiệp vụ và Lộ trình nâng cấp dành riêng cho phân hệ IoT Gateway, do đó nó phải được lưu trữ độc quyền tại `sdms-iot-gateway/docs/`.
> - **Cross-Check:** Các ID và mô hình dữ liệu trong tài liệu này đã được đối chiếu chéo (Cross-checked) với mã nguồn C++ (`Config.h`) và Backend Java (`FaceVerificationServiceImpl`, `AccessEvaluationService`).

---

## 1. DỮ LIỆU NỀN IOT (IOT MASTER DATA)
Hệ thống hiện tại được tối ưu hóa cho mô hình quản lý **1 Tòa nhà Ký túc xá** với **3 Cổng ra vào**. Dữ liệu nền (Master Data) được định nghĩa tĩnh (Hardcoded UUID) tại Edge Device (ESP32) để giảm tải Database và tăng tốc độ xử lý xác thực theo kiến trúc Decentralized IoT.

### 1.1. Tòa nhà (Building)
*   **Building ID (Gốc):** `B1` (hoặc có thể map với UUID hợp lệ của Backend).
*   **Tên Tòa nhà:** Ký túc xá Khu B - Tòa B1.
*   **Chức năng:** Là thực thể cao nhất áp dụng các luật Giờ giới nghiêm (Curfew) chung cho toàn bộ sinh viên lưu trú bên trong.

### 1.2. Danh sách Cổng (Gates)
Hệ thống gồm 3 Cổng, mỗi cổng được cấp 1 `GATE_ID` cố định. 
*(Trong phiên bản Demo hiện tại, ta chỉ có 1 mạch ESP32-CAM nên đang đóng vai trò là Cổng Chính).*

1.  **Cổng Chính (Main Gate):**
    *   `DEVICE_ID`: `ESP32_CAM_001`
    *   `GATE_ID`: `123e4567-e89b-12d3-a456-426614174000` (Đang sử dụng thực tế)
    *   **Đặc điểm:** Hỗ trợ Nhận diện Khuôn mặt (AI) & Quẹt thẻ (RFID tương lai).

2.  **Cổng Phụ 1 (Side Gate 1 - Lối nhà xe):**
    *   `DEVICE_ID`: `ESP32_CAM_002`
    *   `GATE_ID`: `223e4567-e89b-12d3-a456-426614174001` (Quy hoạch tương lai)
    *   **Đặc điểm:** Chỉ hỗ trợ Quẹt thẻ RFID (Bảo vệ quét).

3.  **Cổng Phụ 2 (Side Gate 2 - Lối đi bộ):**
    *   `DEVICE_ID`: `ESP32_CAM_003`
    *   `GATE_ID`: `323e4567-e89b-12d3-a456-426614174002` (Quy hoạch tương lai)
    *   **Đặc điểm:** Hỗ trợ Nhận diện Khuôn mặt (AI).

---

## 2. CHÍNH SÁCH XÁC THỰC & AN NINH (AUTHENTICATION POLICIES)

Mọi luồng dữ liệu (Data Flow) từ lúc ESP32 chụp ảnh cho đến khi Relay mở cửa phải tuân thủ 2 tầng chính sách an ninh sau:

### Tầng 1: Nhận diện Danh tính (Identity Verification)
*   **Phương thức hiện tại (Sprint 1&2):** Nhận diện khuôn mặt (`VerificationMethod.FACE_AI`).
*   **Tiêu chuẩn:** Hệ thống trích xuất Vector 512 chiều từ ảnh. Điểm tin cậy (Confidence Score) tính bằng khoảng cách Cosine (Cosine Similarity). 
*   **Điều kiện Đạt:** Cosine Distance phải `<= 0.2` (Tức độ giống nhau >= 80%).
*   **Ngoại lệ:** Nếu ánh sáng yếu (trả về lỗi `No face detected`), User được phép chủ động bấm "Bật đèn Flash" từ UI để thử lại. Nếu bấm quá 1 lần trong 2 giây, kích hoạt luật **Anti-Spam / Rate Limiting**.

### Tầng 2: Đánh giá Quyền truy cập (Access Evaluation)
Sau khi "Nhận diện đúng người", Backend tiếp tục kiểm tra "Có đúng thời điểm không" dựa vào phân loại sinh viên (Nội trú / Khách):
1.  **Luật Giới nghiêm (Curfew Policy) - Dành cho Sinh viên Nội trú (BOARDING):**
    *   Backend tra cứu `building_id` của Sinh viên.
    *   So sánh giờ hiện tại với giờ giới nghiêm của Tòa nhà đó.
    *   Nếu đang trong giờ cấm xuất/nhập -> Trả về `DENIED` (Lý do: `CURFEW_VIOLATION`), mặc dù nhận diện đúng mặt.
2.  **Luật Khung giờ (Time Window Policy) - Dành cho Người ngoài/Khách (GUEST/STAFF):**
    *   Chỉ cho phép vào theo khung giờ đã đăng ký trước.
    *   Lỗi vi phạm: `OUTSIDE_TIME_WINDOW`.

*(Chi tiết code đánh giá nằm tại: `sdms-backend/src/main/java/com/sdms/backend/modules/smartaccess/application/service/AccessEvaluationService.java`)*

---

## 3. LỘ TRÌNH TỐI ƯU VÀ MỞ RỘNG (FUTURE ROADMAP)

Để đưa hệ thống này từ mức "Đồ án Demo" lên mức "Giải pháp Chuyên nghiệp (Enterprise)", hệ thống cần triển khai 2 đầu mục lớn sau:

### 3.1. Chuyển đổi Master Data: Phân tách `gates` và `iot_devices` (Centralized Management)
*   **Thực trạng:** `GATE_ID` đang được Hardcode cứng vào C++ và Backend đang đồng nhất Cổng = Thiết bị.
*   **Kiến trúc Enterprise Tương lai (Domain-Driven Design):** Cần tách bạch rõ ràng giữa Vị trí Logic (Gate) và Phần cứng vật lý (Device):
    1.  **Bảng `gates` (Cổng):** Gồm `gate_id`, `name` (VD: Cổng Chính), `building_id`, `direction` (IN/OUT). Đây là điểm chốt chặn logic, hiếm khi thay đổi. Lịch sử `access_history` sẽ trỏ tới bảng này.
    2.  **Bảng `iot_devices` (Thiết bị):** Gồm `device_id`, `mac_address`, `status`, `gate_id`. Một thiết bị ESP32 cụ thể sẽ được "gắn" vào một cái Cổng (`gate_id`).
*   **Tại sao phải tách?** Nếu phần cứng ESP32 bị sét đánh hỏng, Admin chỉ việc mua mạch mới và cập nhật lại `iot_devices` trỏ về `gate_id` cũ. Toàn bộ Lịch sử ra vào của sinh viên (truy xuất theo `gate_id`) sẽ được bảo toàn nguyên vẹn, không bị đứt gãy dữ liệu. Mạch cũ mang đi sửa, mạch mới thay thế ngay lập tức.

### 3.2. Tích hợp Mô-đun Thẻ Từ (RFID MFRC522)
*   **Thực trạng:** Code C++ đã khai báo cấu trúc RFID nhưng đang bị tắt (`#define ENABLE_RFID false`) do chưa gắn phần cứng.
*   **Tương lai:**
    *   Kích hoạt lại RFID. Nối chân tín hiệu vào `GPIO 2` và `GPIO 15`.
    *   Bổ sung luồng xác thực dự phòng (Fallback Authentication): Nếu nhận diện khuôn mặt thất bại (do đeo khẩu trang, trời mưa mù), sinh viên chỉ cần quẹt thẻ.
    *   ESP32 sẽ gửi mã thẻ qua API `/api/v1/smartaccess/verify/card` (API này đã được Backend xây dựng sẵn).
    *   Backend phát sự kiện `IdentityVerifiedEvent` với method là `RFID` thay vì `FACE_AI`.

---
*Tài liệu được tuân thủ nghiêm ngặt theo các luật: CROSS-MODULE SAFETY, DOCUMENT PLACEMENT, và ANTI-ASSUMPTION.*
