# SDMS Application Document Compliance Review (v1.0)

Bản tài liệu này kiểm toán tính tuân thủ pháp lý và kỹ thuật của toàn bộ các tài liệu, biểu mẫu điện tử và cơ chế sinh PDF của hệ thống SDMS, đối chiếu trực tiếp với các biểu mẫu KTX Trường Đại học Công nghệ Sài Gòn (STU) đã được phê duyệt.

---

## 1. Phân loại Trường Dữ liệu (Form Fields Classification)

Để đảm bảo độ chính xác và tránh tự ý thêm bớt các thông tin không cần thiết, toàn bộ các trường dữ liệu được phân chia cụ thể thành hai nhóm chính:

### A. PHYSICAL FORM FIELD (Trường dữ liệu trích xuất gốc từ mẫu giấy)
*Đây là các trường bắt buộc xuất hiện trong bản giấy thực tế của phiếu đăng ký hoặc bản cam kết STU:*

1.  `fullName` (Họ và tên): Họ tên sinh viên, viết chữ IN HOA có dấu.
2.  `gender` (Giới tính): Nam / Nữ.
3.  `dob` (Ngày sinh): Định dạng ngày/tháng/năm.
4.  `pob` (Nơi sinh): Tỉnh/Thành phố sinh viên sinh ra.
5.  `ethnic` (Dân tộc): Thành phần dân tộc (Kinh, Hoa, Tày...).
6.  `religion` (Tôn giáo): Tôn giáo (Không, Phật giáo, Thiên chúa giáo...).
7.  `cccd` (Số CMND/CCCD): Số định danh cá nhân hoặc chứng minh nhân dân.
8.  `issueDate` (Ngày cấp): Ngày cấp CCCD/CMND.
9.  `issuePlace` (Nơi cấp): Nơi cấp CCCD/CMND.
10. `studentCode` (Mã số sinh viên): MSSV chính thức (Trống/Nullable đối với Tân sinh viên nhóm A).
11. `faculty` (Khoa): Khoa đào tạo của sinh viên tại STU.
12. `phone` (Điện thoại di động): Số điện thoại liên lạc trực tiếp (Bắt buộc).
13. `permanentAddress` (Địa chỉ hộ khẩu thường trú): Ghi đúng theo sổ hộ khẩu/residency record.
14. `contactAddress` (Địa chỉ liên hệ hiện tại): Địa chỉ tạm trú hoặc liên lạc khi cần.
15. `fatherName` (Họ và tên Cha).
16. `fatherYob` (Năm sinh Cha).
17. `fatherJob` (Nghề nghiệp Cha).
18. `fatherPhone` (Số điện thoại Cha).
19. `motherName` (Họ và tên Mẹ).
20. `motherYob` (Năm sinh Mẹ).
21. `motherJob` (Nghề nghiệp Mẹ).
22. `motherPhone` (Số điện thoại Mẹ).
23. `familyContact` (Địa chỉ/Điện thoại liên hệ khi cần - Mục II.3): Địa chỉ và điện thoại khẩn cấp của gia đình.
24. `roomCode` (Phòng số - trên bản cam kết): Số phòng được xếp trong KTX (Chỉ có giá trị khi hồ sơ đã duyệt cấp giường).

### B. SDMS EXTENSION FIELD (Trường dữ liệu mở rộng phục vụ hệ thống)
*Đây là các trường được thêm vào hệ thống SDMS để vận hành kỹ thuật và tích hợp thanh toán/xác thực:*

1.  `email` (Địa chỉ Email): Bắt buộc. Phục vụ nhận mã kích hoạt tài khoản, liên kết thanh toán, nhận thông báo điện tử. **Không có trên biểu mẫu giấy.**
2.  `emergencyContact` (Liên hệ khẩn cấp mở rộng): Ghi nhận số điện thoại phụ phòng trường hợp không liên lạc được với cha mẹ. Được đánh dấu rõ là **SDMS Extension**.
3.  `applicationCode` (Mã hồ sơ): Mã định danh duy nhất dạng `APP-YYYY-XXXXX` dùng để truy xuất.
4.  `status` (Trạng thái hồ sơ): Quản lý vòng đời (PENDING, WAITING_PAYMENT...).
5.  `priorityScore` (Điểm ưu tiên): Điểm số tính toán từ các minh chứng ưu tiên được duyệt.
6.  `paymentDeadline` (Hạn thanh toán): Thời gian 3 ngày để hoàn tất hóa đơn tiền phòng.
7.  `reviewedByUserId` (Người duyệt): Soft reference đến tài khoản admin thực hiện duyệt đơn.
8.  `reviewNote` (Ghi chú duyệt): Lý do từ chối hoặc yêu cầu bổ sung.
9.  `clientIpAddress` (Địa chỉ IP): Địa chỉ IP thiết bị nộp hồ sơ, phục vụ bảo mật.
10. `commitmentAccepted` (Đã ký cam kết điện tử): Trạng thái xác nhận đồng ý với bản cam kết.
11. `commitmentAcceptedAt` (Thời gian ký cam kết điện tử).
12. `commitmentVersion` (Phiên bản cam kết): Nhận diện phiên bản quy chế áp dụng.

---

## 2. Kiểm toán Tài liệu Bản cam kết (Commitment Compliance Audit)

*   **Không còn Curfew 23:00:** Bản cam kết STU quy định tắt chuông điện thoại và giữ trật tự sau **22h00** (Điều 9) và phải đeo thẻ lưu trú trước khi ra vào KTX (Điều 11) để tránh người lạ xâm nhập. Không đề cập đến mốc 23h00. Hệ thống SDMS loại bỏ mốc 23h00 trong toàn bộ các cấu hình số.
*   **Không còn Community Activities:** Điều khoản "Hoạt động cộng đồng" bị xóa bỏ trong cam kết do không xuất hiện trong biểu mẫu bản cam kết gốc của STU.
*   **Không còn Check-in/Check-out Clause tự phát:** Rút gọn điều khoản bàn giao phòng theo đúng thực tế Điều 11 (Bàn giao phòng khi trả phòng/chuyển phòng).
*   **Xóa bỏ xăm mình và các tệ nạn:** Cập nhật chính xác Điều 1 về xăm mình ("không xăm mình" - quy định gốc của KTX STU).

---

## 3. Xác nhận Sự phù hợp của Bảng Tài liệu Sinh tự động (ApplicationGeneratedDocument)

Thực thể `ApplicationGeneratedDocument` (được thiết kế dạng $1:N$ với `DormitoryApplication`) là **hoàn toàn đầy đủ và tối ưu** để hỗ trợ nghiệp vụ lưu trữ hai loại PDF tự động:

1.  **`REGISTRATION_FORM` (Phiếu đăng ký lưu trú):**
    *   *Nội dung:* Chứa toàn bộ thông tin cá nhân, gia đình và các đối tượng ưu tiên đánh dấu kèm mã vạch hồ sơ.
    *   *Nguồn dữ liệu:* Phối hợp từ `DormitoryApplication` và các liên kết `ApplicationPriority`.
2.  **`COMMITMENT_FORM` (Bản cam kết lưu trú):**
    *   *Nội dung:* Chứa thông tin định danh sinh viên và toàn văn 11 điều cam kết quy định xử lý nghiêm ngặt (ví dụ: Buộc ra khỏi KTX nếu vi phạm các điều 1, 2, 3, 4, 5, 11).

### Cơ chế Lưu trữ Bảo mật (Security & Isolation):
*   Cả hai file PDF được sinh tự động ngay sau khi sinh viên bấm nộp hồ sơ.
*   Lưu trữ tại thư mục riêng tư (private bucket) trên hệ thống MinIO/S3.
*   Tuyệt đối không cấp quyền truy cập công khai. Sinh viên hoặc quản trị viên chỉ được tải file thông qua các đường dẫn tạm thời (pre-signed URL) có thời gian hết hạn cực ngắn (5-10 phút) do máy chủ SDMS sinh ra.

---

## 4. PASS / WARNING / FAIL

*   **Trạng thái:** **PASS**. Toàn bộ 11 điều cam kết và 7 nhóm ưu tiên được trích xuất nguyên trạng từ biểu mẫu STU; các trường mở rộng hệ thống (như email, emergencyContact) được phân loại rõ ràng; không còn các điều khoản tự suy diễn.

---

## 5. Quyết định Cuối cùng

**APPLICATION-05 FIX PASS**
