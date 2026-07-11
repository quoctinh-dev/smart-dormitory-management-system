# ĐỊNH HƯỚNG KIẾN TRÚC: AI QUALITY CHECKER (HỖ TRỢ DUYỆT ẢNH KHUÔN MẶT)

## 1. Tầm nhìn và Mục tiêu
Trong tương lai (Giai đoạn tối ưu hóa của Đồ án), hệ thống Smart Dormitory Access sẽ nâng cấp luồng Kiểm duyệt khuôn mặt từ **"Duyệt thủ công 100%"** lên mức **"Hỗ trợ quyết định bởi AI (Decision Support - Human-in-the-loop)"**.

AI sẽ không tự động ra quyết định thay con người (nhằm đảm bảo tính pháp lý và an toàn tuyệt đối). Thay vào đó, AI đóng vai trò như một Trợ lý phân tích chất lượng ảnh ngay khi sinh viên vừa upload, giúp Admin chỉ mất 1-2 giây để ra quyết định thay vì phải soi kỹ từng ảnh.

## 2. Luồng nghiệp vụ mới (Tương lai)
1. **Sinh viên** upload ảnh từ Mobile App.
2. **Spring Boot** nhận file ảnh, upload lên Cloudinary.
3. Thay vì lưu ngay vào DB, **Spring Boot** gọi sang một API mới của **Python AI Engine** (`/api/v1/faces/analyze-quality`).
4. **Python AI** tính toán bằng OpenCV/MediaPipe và trả về các chỉ số:
   - `quality_score` (0-100)
   - `blur_level` (Low/Medium/High)
   - `brightness` (Good/Dark/Overexposed)
   - `has_mask` (Boolean)
5. **Spring Boot** nhận JSON này, gộp chung với URL ảnh và lưu vào bảng `face_profiles` (Trạng thái vẫn là `PENDING`).
6. **Web Admin** hiển thị ảnh kèm một Bảng Điểm (Score Card) nhỏ bên cạnh ảnh.
7. **Admin** nhìn điểm số (VD: Xanh/Đỏ) và nhấn Approve hoặc Reject.

## 3. Lộ trình triển khai (Implementation Roadmap)

### A. Tầng AI (Python)
- **Công nghệ:** OpenCV (Laplacian Variance đo độ mờ, Mean intensity đo độ sáng), MediaPipe (Face Mesh để check khẩu trang).
- **API:** Xây dựng endpoint POST nhận URL ảnh hoặc base64, trả về JSON phân tích.

### B. Tầng Backend (Java Spring Boot)
- **Database:** Thêm các cột vào Entity `FaceProfile`:
  ```sql
  ALTER TABLE face_profiles ADD COLUMN quality_score INT;
  ALTER TABLE face_profiles ADD COLUMN blur_level VARCHAR(20);
  ALTER TABLE face_profiles ADD COLUMN brightness VARCHAR(20);
  ALTER TABLE face_profiles ADD COLUMN has_mask BOOLEAN;
  ```
- **Service:** Cập nhật `FaceProfileServiceImpl` để tích hợp lời gọi API sang Python trước khi `save()`.

### C. Tầng Web Admin (React TypeScript)
- Cập nhật DTO trả về cho Web.
- Vẽ thêm các Badge nhỏ (Màu xanh lá cho "Tốt", Màu đỏ cho "Xấu") đính ngay trên góc thẻ ảnh trong file `FaceApprovalQueue.tsx`.

---

## 4. PROMPT KÍCH HOẠT TRIỂN KHAI 
*(Khi nào bạn sẵn sàng code tính năng này, hãy Copy nguyên đoạn Prompt dưới đây và gửi cho AI)*

```text
Chào AI, tôi muốn bắt đầu triển khai tính năng "AI Quality Checker" theo định hướng trong file `docs/future_architecture_ai_quality_checker.md`. 

Chúng ta sẽ làm từng bước. 
Bước 1: Hãy giúp tôi code thêm một endpoint API `/api/v1/faces/analyze-quality` bên trong project Python (`sdms-face-extraction`). Yêu cầu dùng OpenCV tính độ mờ (Blur bằng Laplacian), độ sáng (Brightness) và trả về điểm Quality Score. Bắt đầu với Python trước nhé.
```
