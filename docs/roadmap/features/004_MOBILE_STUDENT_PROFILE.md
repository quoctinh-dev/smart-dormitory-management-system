# TÍNH NĂNG: QUẢN LÝ HỒ SƠ CÁ NHÂN (STUDENT PROFILE) TRÊN MOBILE APP

**Mục tiêu:** Xây dựng màn hình Hồ sơ cá nhân (Profile) trên ứng dụng Mobile dành cho Sinh viên (Role: STUDENT). Màn hình này cho phép sinh viên xem toàn bộ thông tin cá nhân của mình và cập nhật một số trường thông tin liên lạc nhất định.

---

## 1. YÊU CẦU API VÀ DỮ LIỆU
Bên Backend đã cung cấp sẵn 2 APIs bảo mật (yêu cầu gửi kèm `Bearer <Student_Token>`):

### A. Lấy thông tin hồ sơ hiện tại
- **Endpoint:** `GET /api/v1/students/me`
- **Chức năng:** Trả về toàn bộ dữ liệu của `Student` (bao gồm cả các trường khóa và không khóa).
- **Mục đích:** Dùng để render (đổ dữ liệu) lên form Profile ban đầu khi sinh viên mở app.

### B. Cập nhật thông tin hồ sơ
- **Endpoint:** `PATCH /api/v1/students/me`
- **Body Request (`UpdateProfileRequest`):**
  ```json
  {
    "phone": "string",
    "fatherName": "string",
    "fatherPhone": "string",
    "motherName": "string",
    "motherPhone": "string",
    "emergencyContact": "string",
    "permanentAddress": "string",
    "avatarUrl": "string"
  }
  ```
- **Chức năng:** Chỉ gửi đi những trường mà sinh viên đã chỉnh sửa (các trường không gửi sẽ giữ nguyên giá trị cũ trên Backend).

---

## 2. QUY TẮC HIỂN THỊ UI/UX VÀ KHÓA TRƯỜNG DỮ LIỆU (LOCKED FIELDS)

Trên giao diện Mobile, Agent cần chia form thành 2 phân vùng rõ rệt:

### 🔴 Phân vùng 1: Thông tin định danh (CHỈ ĐỌC - READONLY)
Các thông tin này liên quan đến định danh pháp lý và học vụ, hệ thống Backend **không cho phép sửa**. Trên UI phải được disable (khóa làm mờ) và hiển thị icon 🔒 (ổ khóa):
1. **Họ và tên** (`fullName`)
2. **Mã số sinh viên** (`studentCode`)
3. **Số CCCD** (`cccd`)
4. **Khoa/Viện** (`faculty`)
6. **Email sinh viên** (`email`)

### 🟢 Phân vùng 2: Thông tin liên lạc (ĐƯỢC PHÉP CHỈNH SỬA - EDITABLE)
Sinh viên được quyền bấm vào để sửa và nhấn nút "Lưu thay đổi" (Save). Trước khi gọi API PATCH, cần validate cơ bản (VD: số điện thoại phải đủ 10 số, email phải đúng định dạng).
1. **Số điện thoại cá nhân** (`phone`)
2. **Địa chỉ thường trú** (`permanentAddress`)
3. **Họ tên Cha** (`fatherName`) & **SĐT Cha** (`fatherPhone`)
4. **Họ tên Mẹ** (`motherName`) & **SĐT Mẹ** (`motherPhone`)
5. **Liên hệ khẩn cấp khác** (`emergencyContact`)
6. **Ảnh đại diện** (`avatarUrl` - Có thể làm tính năng Upload ảnh lên Cloudinary sau)

---

## 3. TRIGGER PROMPT DÀNH CHO AGENT MOBILE
*Copy đoạn Prompt bên dưới và dán vào cửa sổ chat của Agent thuộc dự án `sdms-mobile-app`:*

```text
@Agent Mobile: Chúng ta cần triển khai Màn hình "Hồ sơ cá nhân" (Profile Screen) cho ứng dụng sinh viên.

1. Hãy tạo `ProfileScreen.tsx` (hoặc `.dart` tùy framework) với một Form hiển thị đầy đủ thông tin.
2. Form cần chia làm 2 nhóm:
   - Nhóm Read-only (bị disable, có icon ổ khóa): fullName, studentCode, cccd, faculty, academicYear, email.
   - Nhóm Editable (được phép sửa): phone, permanentAddress, fatherName, fatherPhone, motherName, motherPhone, emergencyContact.
3. Khi màn hình khởi tạo, gọi API `GET /api/v1/students/me` (nhớ đính kèm Token) để lấy dữ liệu đổ vào form.
4. Khi sinh viên nhấn "Lưu", hãy gom các trường có sự thay đổi và gọi API `PATCH /api/v1/students/me` để cập nhật lên Backend. Nếu API báo lỗi `email` sai định dạng, hãy show Toast/Snackbar báo lỗi tương ứng.

Tiến hành code ngay màn hình này và test trên thiết bị hoặc Simulator để đảm bảo dữ liệu chạy đúng nhé!
```
