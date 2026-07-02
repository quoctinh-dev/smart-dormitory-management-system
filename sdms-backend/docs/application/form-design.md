# Thiết kế Biểu mẫu và Dữ liệu Đơn đăng ký
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này chuẩn hóa các quy tắc nghiệp vụ, mô hình dữ liệu, và các loại giấy tờ cần thiết để số hóa "Phiếu đăng ký lưu trú" và "Bản cam kết" từ dạng vật lý sang hệ thống SDMS.

---

## 1. Các Trường Dữ liệu trên Biểu mẫu

Đây là các thông tin mà sinh viên cần cung cấp khi điền đơn đăng ký.

*   **A. Thông tin cá nhân:**
    *   `fullName` (Họ và tên)
    *   `gender` (Giới tính): `MALE`, `FEMALE`, `OTHER`.
    *   `dob` (Ngày sinh)
    *   `pob` (Nơi sinh)
    *   `ethnic` (Dân tộc)
    *   `religion` (Tôn giáo)
    *   `studentCode` (Mã số sinh viên - MSSV)
    *   `faculty` (Khoa)
    *   `phone` (Điện thoại)
    *   `email` (Email)
    *   `cccd` (Số CCCD/CMND)
    *   `issueDate` (Ngày cấp CCCD)
    *   `issuePlace` (Nơi cấp CCCD)
    *   `permanentAddress` (Hộ khẩu thường trú)
    *   `contactAddress` (Địa chỉ liên hệ hiện tại)

*   **B. Thông tin gia đình:**
    *   `fatherName`, `fatherYob`, `fatherJob`, `fatherPhone`
    *   `motherName`, `motherYob`, `motherJob`, `motherPhone`

*   **C. Liên hệ khẩn cấp:**
    *   `emergencyContact` (Tên, số điện thoại, địa chỉ người liên hệ khẩn).

## 2. Phân loại Nhóm Sinh viên và Logic Điền đơn

Hệ thống phân biệt 3 nhóm sinh viên với các quy tắc điền đơn khác nhau:

| Nhóm | Mô tả | Logic điền dữ liệu | Tác động hệ thống sau khi thanh toán |
| :--- | :--- | :--- | :--- |
| **Nhóm A (Tân sinh viên)** | Sinh viên mới, chưa có MSSV hoặc chưa có trong CSDL của trường. | - `cccd`, `fullName`, `email` được điền tự động từ danh sách hợp lệ. <br>- `studentCode` để trống. <br>- Các thông tin cá nhân khác phải tự điền. | Tạo mới cả `Student` và `UserAccount`. |
| **Nhóm B (Sinh viên năm trên, chưa ở KTX)** | Sinh viên đã có MSSV và có trong CSDL của trường. | - `cccd`, `fullName`, `email`, `studentCode` được điền tự động. <br>- Các thông tin cá nhân khác phải tự điền. | Tạo mới `Student` và `UserAccount` (liên kết với hồ sơ sinh viên có sẵn của trường). |
| **Nhóm C (Sinh viên cũ, gia hạn)** | Sinh viên đang ở KTX và nộp đơn gia hạn. | - Toàn bộ thông tin được điền tự động từ hồ sơ `Student` đã có trong hệ thống. <br>- Sinh viên chỉ cần cập nhật lại các giấy tờ ưu tiên (nếu có). | Không tạo mới, chỉ tạo một đơn đăng ký (`DormitoryApplication`) mới để xét duyệt lại. |

## 3. Ma trận Giấy tờ Xác minh (`VerificationDocument`)

Sinh viên phải tải lên các bản scan/ảnh của các giấy tờ sau:

| Loại giấy tờ (`VerificationDocumentType`) | Nhóm A | Nhóm B | Nhóm C | Bắt buộc / Tùy chọn |
| :--- | :---: | :---: | :---: | :--- |
| **`PORTRAIT_PHOTO`** (Ảnh 3x4) | Có | Có | Có | **Bắt buộc** (Dùng cho thẻ và đăng ký khuôn mặt) |
| **`CCCD_FRONT`** (CCCD mặt trước) | Có | Có | Không | **Bắt buộc** cho Nhóm A & B |
| **`CCCD_BACK`** (CCCD mặt sau) | Có | Có | Không | **Bắt buộc** cho Nhóm A & B |
| **`COMMITMENT_FORM`** (Bản cam kết) | Có | Có | Có | **Bắt buộc** (Sinh viên phải in, ký, và tải lên) |
| **`PRIORITY_CERTIFICATE`** (Giấy tờ ưu tiên) | Tùy chọn | Tùy chọn | Tùy chọn | **Bắt buộc chỉ khi muốn hưởng điểm ưu tiên** |

## 4. Thiết kế Tạo PDF Tự động

Hệ thống sẽ tự động tạo ra 2 file PDF khi sinh viên nộp đơn thành công.

### A. PDF 01: Phiếu Đăng ký Lưu trú (`REGISTRATION_FORM`)
*   **Thời điểm tạo:** Ngay khi sinh viên nhấn "Nộp đơn".
*   **Nguồn dữ liệu:** Dữ liệu từ đơn đăng ký mà sinh viên vừa điền.
*   **Mục đích:** Lưu trữ một bản sao chính xác của đơn đăng ký tại thời điểm nộp.

### B. PDF 02: Bản Cam kết (`COMMITMENT_FORM`)
*   **Thời điểm tạo:** Cùng lúc với Phiếu Đăng ký.
*   **Nguồn dữ liệu:** Ghép thông tin `fullName`, `cccd`, `dob` của sinh viên vào một mẫu cam kết có sẵn (chứa 11 điều khoản).
*   **Mục đích:** Tạo ra một bản cam kết chính thức để sinh viên in ra, ký tên và tải lại lên hệ thống.

### Lưu trữ PDF
*   Để tránh làm phình to bảng `DormitoryApplication`, các đường dẫn đến file PDF được lưu trong một bảng riêng là `ApplicationGeneratedDocument`.
*   **Đối chiếu code:** Logic tạo và lưu trữ PDF **chưa được triển khai** trong các service của module `application`. Đây là một "khoảng trống" lớn cần được lấp đầy. `ApplicationPdfService` cần được tạo ra để xử lý nghiệp vụ này một cách bất đồng bộ.
