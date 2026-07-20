# Tính năng: Ứng dụng OCR CCCD & Thẻ sinh viên trong luồng đăng ký
**ID:** 003
**Trạng thái:** Kế hoạch (Planned)

## 1. Tầm nhìn (Vision)
Trải nghiệm Đăng ký Lưu trú hiện tại (Step 1 -> Step 2) đòi hỏi sinh viên nhập tay một lượng lớn dữ liệu cá nhân (Họ tên, CCCD, Ngày sinh, Địa chỉ...). Điều này dễ dẫn đến sai sót và tốn thời gian. 
Tầm nhìn của tính năng này là: **Đảo ngược quy trình**. 
Sinh viên sẽ upload ảnh CCCD (mặt trước/sau) ngay từ đầu. Hệ thống sẽ gọi API AI/OCR để bóc tách thông tin và tự động điền (Auto-fill) vào form. Sinh viên chỉ việc kiểm tra và sửa lại nếu cần.
Đồng thời, bổ sung cơ chế kiểm soát Thẻ Sinh Viên (TSV) để tăng tính xác thực cho các đối tượng Cựu Sinh Viên hoặc Tân Sinh Viên đã hoàn thành Tuần Sinh Hoạt Công Dân.

## 2. Luồng Nghiệp vụ Mới (Business Flow)
- **Bước 0 (Giữ nguyên):** Nhập Email, nhận và xác thực OTP để vào trong.
- **Bước 1 MỚI (Tải tài liệu định danh):** 
  - Hệ thống yêu cầu tải lên Ảnh CCCD (Mặt trước + Mặt sau).
  - Có tùy chọn tải lên Thẻ Sinh Viên (Tùy chọn cho Tân sinh viên, Bắt buộc cho Cựu sinh viên). Tân sinh viên đã qua "Tuần sinh hoạt công dân" có thể upload ngay.
- **Xử lý AI (OCR):**
  - Gửi ảnh CCCD qua AI Service (hoặc 3rd party OCR API như FPT.AI / VNPT eKYC).
  - Bóc tách: Họ tên, Số CCCD, Ngày sinh, Quê quán, Địa chỉ thường trú.
- **Bước 2 MỚI (Xác nhận & Bổ sung thông tin):**
  - Form được điền sẵn 80% dữ liệu từ OCR.
  - Sinh viên nhập thêm các thông tin còn thiếu (Khoa, SĐT, Thông tin Cha Mẹ, Diện Ưu Tiên).
- **Quy tắc Ưu tiên cho Đợt Tự Do (Open Registration):**
  - Trong Đợt Tự Do, bộ đếm điểm ưu tiên (Priority Score) vẫn phải ưu tiên cộng điểm đặc biệt cho **Tân Sinh Viên của năm hiện tại**. Cơ chế nhận diện dựa trên (Năm hiện tại - Năm sinh) hoặc (Khóa học/Trường).

## 3. Lộ trình Triển khai (Implementation Roadmap)
1. **AI Service:** Cập nhật `sdms-ai-service` hoặc Backend kết nối với API OCR bên thứ ba để trích xuất text từ ảnh CCCD.
2. **Backend:** 
   - Viết API `POST /api/v1/applications/ocr-extract` nhận file ảnh trả về JSON data.
   - Bổ sung trường `studentCardUrl` vào `DormitoryApplication` (hoặc loại `VerificationDocumentType.STUDENT_CARD`).
   - Cập nhật Engine tính điểm xếp phòng (`ApplicationPriorityService.java`) để cộng điểm ưu tiên cho Tân sinh viên trong đợt `OPEN_REGISTRATION`.
3. **Frontend:**
   - Thay đổi thứ tự Step trong `RegistrationPage.tsx` (Chuyển Document Upload lên trước Info Section).
   - Thêm UX/UI cho màn hình "Đang quét CCCD...".
   - Tự động bind (Auto-fill) kết quả OCR vào State `formData`.

## 4. Trigger Prompt (Dành cho Agent kế tiếp)
```text
@Antigravity Hãy bắt đầu triển khai Tính năng 003: "Ứng dụng OCR CCCD & Thẻ sinh viên". 
Trước tiên, hãy khảo sát xem trong hệ thống SDMS chúng ta sẽ tự viết OCR bằng Python (sdms-ai-service) hay sẽ mock một API gọi sang bên thứ 3. Sau đó, hãy tiến hành sửa Backend để tiếp nhận CCCD từ Bước 1, bóc tách thông tin và trả về cho Frontend Auto-fill nhé.
```
