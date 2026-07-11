# FUTURE PLAN: TÁI CẤU TRÚC LUỒNG ĐĂNG KÝ NỘI TRÚ (STUDENT CODE & OCR)

## 1. Vision (Tầm nhìn)
Thay đổi hoàn toàn tư duy quản lý thông tin đầu vào của hệ thống KTX. Chuyển từ việc phân tách "Tân sinh viên" (chưa có mã SV) và "Cựu sinh viên" (đã có mã SV) sang một **Luồng đồng nhất duy nhất (Unified Flow)** dựa trên thực tế: **Mọi sinh viên khi nộp đơn đều đã được trường cấp Mã số sinh viên (Student Code)**. Đồng thời, áp dụng công nghệ AI OCR để tự động hóa trích xuất giấy tờ, giảm thiểu thao tác nhập liệu thủ công.

---

## 2. Business Flow (So sánh Nghiệp vụ Cũ và Mới)

### 2.1 Luồng hiện tại (Old Flow - V1)
Được thiết kế dựa trên giả định Tân sinh viên chưa có mã số sinh viên.
- **Bước 1 (Check Eligibility):** Sinh viên nhập số CMND/CCCD. Hệ thống chọc vào bảng `registration_eligibilities` để kiểm tra CCCD này có nằm trong danh sách được phép đăng ký hay không.
- **Bước 2 (Phân loại tự động):** Nếu CCCD thuộc nhóm Tân sinh viên (`FRESHMAN`), hệ thống **không yêu cầu** Mã số sinh viên.
- **Bước 3 (Điền Form):** Sinh viên gõ tay toàn bộ 30+ trường thông tin (Họ tên, Ngày sinh, Quê quán, Địa chỉ thường trú...).
- **Bước 4 (Duyệt & Tạo tài khoản):** Khi Admin duyệt đơn (`APPROVED`), hệ thống mới tạo `UserAccount` dựa vào email và cấp cho một danh tính là `Student`.

### 2.2 Luồng tái cấu trúc (New Demo Flow - V2)
- **Bước 1 (AI OCR & Eligibility Check):** 
  - Sinh viên **tải lên ảnh CCCD (Mặt trước/Mặt sau)**. AI OCR tự động trích xuất: `CCCD, Họ tên, Ngày sinh, Giới tính, Quê quán, Thường trú`.
  - Sinh viên nhập thêm **Mã số sinh viên (Student Code)** (Bắt buộc với tất cả).
  - Hệ thống bắn bộ đôi `[CCCD + Student Code]` vào kiểm tra trong tệp Whitelist.
- **Bước 2 (Điền Form):** 
  - Form được **điền tự động 80%** từ dữ liệu OCR. Sinh viên chỉ việc bổ sung thông tin liên hệ của Cha/Mẹ và Số điện thoại.
- **Bước 3 (Duyệt & Tự động hóa ERP):** 
  - Khi `APPROVED`, hệ thống sinh ra tài khoản và mapping chính xác `Student Code` này, đảm bảo dữ liệu chuẩn 100% để sau này đồng bộ ngược lại với Cổng thông tin đào tạo (University ERP) của trường.

---

## 3. Implementation Roadmap (Phạm vi ảnh hưởng & Các bước triển khai)

Do quy trình Đăng ký là "Dữ liệu nền" (Nguồn cung cấp thông tin gốc tạo ra Cư dân), việc thay đổi sẽ ảnh hưởng dây chuyền đến các module khác. Dưới đây là phân tích ảnh hưởng và các bước thực thi:

### Giai đoạn 1: Database & Entities (Đã hoàn thành một phần)
- **Tác động:** Bảng `dormitory_applications` cần thêm trường `student_code`. 
- **Đã làm:** Script Migration `V38__add_student_code_to_applications.sql` đã được chạy.
- **Việc cần làm:** Xóa bỏ enum `RegistrationTarget` (phân loại FRESHMAN/CURRENT) ở bảng `registration_eligibilities` vì không còn cần thiết.

### Giai đoạn 2: Backend Logic Updates
- **API `CheckEligibility`:** Sửa đổi `ApplicationController` - Không chỉ nhận `cccd` mà phải nhận cả `studentCode` để đối chiếu bảo mật kép.
- **API `CreateDraft`:** `CreateApplicationRequest.java` cần gỡ bỏ các ràng buộc phân nhánh Tân/Cựu, bắt buộc (Require) field `studentCode`.
- **Domain Event (`ApplicationSubmittedEvent` & `PaymentSuccessEvent`):** Nơi xử lý tự động tạo `UserAccount` phải được map `studentCode` vào Entity `Student` thay vì bỏ trống như trước đây.

### Giai đoạn 3: Frontend (Giao diện Sinh viên)
- Sửa 컴포넌트 (Component) `EligibilitySection.tsx` (Bước 0): Bổ sung khu vực Upload ảnh CCCD và input điền Mã số Sinh viên. Gọi API OCR (tạm thời mock nếu AI Service chưa sẵn sàng).
- Sửa `useRegistration.ts`: Cập nhật logic nhận diện trả về, map dữ liệu OCR thẳng vào `formData`.
- Khóa (Disable) các trường dữ liệu trên `InfoSection.tsx` (Bước 1) đã được OCR điền tự động để tránh sinh viên tự ý sửa sai so với CCCD.

### Giai đoạn 4: Clean up (Dọn rác dữ liệu)
- Cập nhật lại các file tài liệu API (`admin_account_management_api.md`, `BUSINESS_RULES.md`) để xóa bỏ hoàn toàn khái niệm phân tách "Tân sinh viên" và "Cựu sinh viên" trong quy trình KTX.

---

## 4. Trigger Prompt (Dành cho AI Agent)
Bất cứ khi nào User sẵn sàng thực hiện tính năng này, hãy Copy và Paste câu lệnh sau:

```text
Tôi đã tìm hiểu xong nghiệp vụ thực tế. Bây giờ hãy bắt đầu thực thi tài liệu 01_REGISTRATION_REFACTOR_STUDENT_CODE.md. 
Hãy bắt đầu từ Giai đoạn 2: Cập nhật lại các Request DTO (Thêm studentCode bắt buộc) và chỉnh sửa logic CheckEligibility trong Backend để không còn phân chia Tân/Cựu sinh viên nữa.
```
