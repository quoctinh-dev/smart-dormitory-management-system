# PHÂN TÍCH UI/UX & GIẢI PHÁP TỐI ƯU TRÁNH CRASH CHO LỊCH SỬ VÀO RA

> **THÔNG TIN QUẢN TRỊ (GOVERNANCE):**
> - **Phạm vi:** Frontend (Web App & Mobile App tương lai).
> - **Lý do đặt file:** Tuân thủ `DOCUMENT PLACEMENT & JUSTIFICATION RULE`. File này chứa đặc tả thiết kế giao diện (UI/UX specs) và xử lý lỗi Frontend nên được đặt tại `sdms-frontend/docs/`.

---

## 1. PHÂN TÍCH VẤN ĐỀ UX (TRẢI NGHIỆM NGƯỜI DÙNG)
Sự nhầm lẫn giữa **Lịch sử Xác thực (Verification)** và **Lịch sử Ra vào (Access)** là pain-point (điểm đau) lớn nhất của sinh viên khi sử dụng hệ thống. 
Sinh viên thường thắc mắc: *"Tại sao app báo nhận diện thành công (SUCCESS) mà cửa không mở?"*.

**Nguyên nhân:**
- Sinh viên không phân biệt được AI nhận diện (Verification) và Logic cấp quyền (Access Evaluation).
- Nếu AI nhận diện thất bại (FAIL), sẽ KHÔNG có dòng log nào trong Access History (vì chưa đi đến bước xét duyệt).

## 2. GIẢI PHÁP TỐI ƯU UI/UX CHO MOBILE APP / STUDENT DASHBOARD
Thay vì tạo 2 màn hình riêng biệt (gây khó hiểu), App nên thiết kế một **"Timeline Ra Vào" (Unified Timeline)**.

### 2.1. Cấu trúc Giao diện Đề xuất (Component Design)
Sử dụng mô hình Card/Timeline kết hợp Badge trạng thái:
- **Trường hợp 1: Mở cửa thành công hoàn toàn**
  - Icon: 🟢 Checkmark (Màu xanh).
  - Tiêu đề: Lên nhà / Ra ngoài thành công.
  - Subtitle: "Khuôn mặt hợp lệ - Đúng giờ quy định".
- **Trường hợp 2: AI nhận diện đúng + Bị từ chối do Giới nghiêm**
  - Icon: 🔴 Lock (Màu đỏ).
  - Tiêu đề: Từ chối mở cửa.
  - Subtitle (Giải thích rõ): "Nhận diện thành công, nhưng bạn đã vi phạm giờ giới nghiêm (Quá 23:00)". 
  - *Data mapping: Lấy từ `denialReason = CURFEW_VIOLATION` trong bảng `access_history`.*
- **Trường hợp 3: AI nhận diện thất bại (Không có log Access)**
  - Icon: 🟡 Warning (Màu vàng).
  - Tiêu đề: Nhận diện khuôn mặt thất bại.
  - Subtitle: "Hệ thống không thể nhận diện rõ mặt bạn. Gợi ý: Hãy thử tháo khẩu trang hoặc bật đèn Flash."

### 2.2. Kỹ thuật Tối ưu tránh Crash (Anti-Crash Strategies)
Để đảm bảo App không bị văng (crash) khi lượng data lịch sử quá lớn hoặc Backend mất kết nối:

1. **Skeleton Loading & Pagination (Tối ưu Hiệu suất):**
   - Không gọi toàn bộ lịch sử. Sử dụng `IntersectionObserver` (Infinite Scroll) hoặc Phân trang (Pagination) giới hạn `size=15` mỗi lần gọi API.
   - Hiển thị Skeleton (Khung xám nhấp nháy) thay vì màn hình trắng trong lúc chờ data.
2. **Error Boundary (React) / Flutter Exception Handling:**
   - Nếu API trả về 500 (Server Error) hoặc timeout, App không được crash. Phải hiển thị Fallback UI: *"Không thể tải lịch sử lúc này. Vui lòng thử lại sau."* cùng nút [Tải Lại].
3. **Data Normalization & Null Safety:**
   - Khi map dữ liệu từ 2 API (`/verifications` và `/access`), luôn phải check null: `history.denialReason ?? 'Lý do không xác định'`. 
   - Nếu IoT Gateway mất mạng, Backend có thể trả về log thiếu đồng bộ. App phải tự động filter các record rác.

## 3. LỘ TRÌNH TRIỂN KHAI CODE BÊN APP
1. Gọi đồng thời 2 API: `getMyVerifications` (từ `FaceStudentController`) và `getMyAccessHistory` (từ `IotVerificationController`).
2. Merge 2 mảng này lại, sort theo `timestamp` giảm dần.
3. Áp dụng thuật toán O(N) để gộp các sự kiện xảy ra trong cùng 1-2 giây: 
   - Nếu có Verification (SUCCESS) + Access (DENIED) -> Hợp nhất thành 1 Card Lỗi (Trường hợp 2).
   - Nếu chỉ có Verification (FAIL) -> Card Lỗi Nhận diện (Trường hợp 3).
