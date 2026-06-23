# SDMS PAYMENT-02: THIẾT KẾ VÒNG ĐỜI HÓA ĐƠN & PHÂN TÍCH LUỒNG NGHIỆP VỤ (BILL LIFECYCLE DESIGN AUDIT & BUSINESS FLOW ANALYSIS) - BAN HÀNH SỬA ĐỔI (CORRECTED)

**Tác giả**: Senior Java Architect | PostgreSQL Architect | Domain Driven Design Architect | SDMS Technical Governance Board

---

## BỐI CẢNH & KHÁI QUÁT CHUNG
Tài liệu này là phiên bản hiệu chỉnh chính thức của `PAYMENT-02` nhằm khắc phục các điểm sai lệch nghiệp vụ thực tế của KTX và đảm bảo tính nhất quán hoàn toàn với cấu trúc Enum có sẵn của hệ thống SDMS.

---

## PHẦN 1 - DOMAIN AUDIT & BILL LIFECYCLE

### 1. Phân tích thời điểm khởi tạo Student và UserAccount (FAIL 01 Correction)
* **Câu hỏi 1 & 2**: Student và UserAccount nên được tạo ở Payment Success hay Check-In thực tế?
  * **Trả lời**: Cả `Student` và `UserAccount` bắt buộc phải được tạo ngay tại thời điểm **Payment Success** (khi hóa đơn tiền phòng và cọc được thanh toán đầy đủ).
* **Câu hỏi 3**: Đánh giá ưu nhược điểm của các phương án:
  * **Phương án A: Khởi tạo tại Payment Success (Lựa chọn tối ưu)**:
    * *Ưu điểm*:
      1. Khớp 100% với đặc tả kỹ thuật và ràng buộc thực tế trong thực thể [StudentHousingAssignment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/entity/StudentHousingAssignment.java): Tại đây trường `student_id` được link trực tiếp vào Assignment ngay sau khi có sự kiện thanh toán thành công (Payment-Linkage).
      2. Cho phép sinh viên đăng nhập cổng thông tin / ứng dụng di động ngay tại nhà (khi tài khoản `UserAccount` ở trạng thái `PENDING_ACTIVATION` được gửi kèm email xác nhận). Sinh viên có thể cập nhật thông tin cá nhân mở rộng (địa chỉ, số điện thoại khẩn cấp, avatar), xem trước thông tin phòng ở, mã giường, và chuẩn bị giấy tờ nhập học trực tuyến.
      3. Giảm tải tối đa thời gian làm thủ tục Check-in trực tiếp tại KTX: Receptionist chỉ cần quét mã QR kiểm tra hồ sơ thực tế và tiến hành bàn giao phòng.
    * *Nhược điểm*: Có thể phát sinh các trường hợp "sinh viên ảo" nếu sinh viên đóng tiền thành công nhưng rút đơn đột xuất trước khi lên ở. Tuy nhiên trường hợp này rất hiếm gặp và được xử lý thông qua luồng hủy đơn/hoàn cọc nghiệp vụ thông thường.
  * **Phương án B: Khởi tạo tại Check-In thực tế**:
    * *Ưu điểm*: Tránh lưu vết các sinh viên thanh toán thành công nhưng không lên ở.
    * *Nhược điểm*: Sinh viên không thể đăng nhập app/portal trước khi check-in, quầy tiếp nhận tại KTX sẽ bị tắc nghẽn nghiêm trọng khi hệ thống phải xử lý đồng thời việc tạo hồ sơ và cấp tài khoản cho hàng ngàn sinh viên trong cùng một thời điểm.
* **Đề xuất cuối cùng**: **Chọn Phương án A**. Kích hoạt tạo `Student` và `UserAccount` ngay sau khi thanh toán thành công.

### 2. Thiết kế cấu trúc Bill cho hồ sơ đăng ký (FAIL 02 Correction)
* **Option A: Gộp Accommodation Fee + Deposit Fee vào cùng 1 Bill**:
  * *Đánh giá*: **WARNING**. 
  * *Lý do*: Tuy đơn giản hóa số lượng giao dịch đối với sinh viên, nhưng vi phạm quy tắc kế toán tài chính. Tiền cọc (`DEPOSIT_FEE`) là khoản nợ phải trả (phải hoàn lại khi sinh viên Check-out), trong khi tiền phòng (`ACCOMMODATION_FEE`) là doanh thu thực tế. Gộp chung sẽ gây khó khăn lớn cho việc đối soát tài chính, khấu trừ tài sản hư hỏng và hoàn cọc sau này.
* **Option B: Tách biệt Accommodation Fee riêng và Deposit Fee riêng thành 2 Bill**:
  * *Đánh giá*: **PASS** (Đề xuất lựa chọn cho SDMS).
  * *Lý do*: Đảm bảo tính minh bạch và tách bạch rõ ràng về bản chất kế toán của hai dòng tiền. 
  * *Giải pháp thực tế*: Hệ thống ở tầng API/Frontend sẽ gộp hiển thị cả 2 hóa đơn này vào một phiên giao dịch thanh toán để sinh viên chỉ cần thực hiện quét mã QR duy nhất 1 lần cho cả 2 khoản thanh toán. Đơn đăng ký chỉ được duyệt chuyển trạng thái thành công khi cả 2 hóa đơn này đều đạt trạng thái `PAID`.

---

## PHẦN 2 - XÁC MINH CẤU TRÚC ENUM HỆ THỐNG

### 1. Xác minh ApplicationStatus (WARNING 01 Correction)
* Trạng thái `PAYMENT_SUCCESS` **KHÔNG** tồn tại trong enum [ApplicationStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/enums/ApplicationStatus.java).
* **Đề xuất thay thế**: Sử dụng trạng thái **`APPROVED`** (Đã duyệt hoàn tất và đã đóng tiền) để khớp 100% với comment nghiệp vụ tại dòng 13 của file enum: `APPROVED, // Hoàn tất (Đã đóng tiền) -> Trigger sinh dữ liệu Student`.

### 2. Xác minh AccountStatus (WARNING 02 Correction)
* Trạng thái `PENDING_ACTIVATION` **CÓ** tồn tại trong enum [AccountStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/user/enums/AccountStatus.java) dòng 7.
* **Đề xuất**: Giữ nguyên sử dụng trạng thái `PENDING_ACTIVATION` cho tài khoản được sinh tự động sau khi thanh toán thành công.

---

## PHẦN 3 - SỰ TƯƠNG THÍCH ROOM MODULE & DDD

* **Cập nhật trạng thái**: Module Payment tuyệt đối **KHÔNG** được tự cập nhật trạng thái `StudentHousingAssignment` và `Bed` sang `OCCUPIED` khi thanh toán thành công.
* **Quy trình chuẩn**:
  1. Thanh toán thành công -> Đơn đăng ký chuyển sang `APPROVED` -> Tạo `Student`, `UserAccount` (`PENDING_ACTIVATION`) -> Cập nhật `student_id` vào `StudentHousingAssignment`. **Assignment và Bed vẫn giữ nguyên trạng thái `RESERVED`**.
  2. Sinh viên đến KTX -> Admin kiểm tra hồ sơ và bàn giao tài sản -> Admin bấm xác nhận Check-In trên Dashboard -> Hệ thống gọi API check-in của Room Module -> `StudentHousingAssignment` và `Bed` chuyển sang **`OCCUPIED`**.

---

## PHẦN 4 - MA TRẬN CHUYỂN TRẠNG THÁI (STATE TRANSITIONS)

* **DormitoryApplication**:
  `PENDING` ──► `UNDER_REVIEW` ──► `WAITING_PAYMENT` ──(Thanh toán thành công)──► `APPROVED`
* **StudentHousingAssignment**:
  `RESERVED` ──(Thanh toán thành công)──► `RESERVED` (Vẫn giữ nguyên) ──(Admin làm thủ tục Check-In)──► `OCCUPIED`
* **Bed**:
  `RESERVED` ──(Thanh toán thành công)──► `RESERVED` ──(Admin làm thủ tục Check-In)──► `OCCUPIED`
* **Bill**:
  `UNPAID` ──► `PAID`
* **Payment**:
  `PENDING` ──► `SUCCESS` / `FAILED`

---

## CORRECTION PATCH MATRIX

| Điểm sửa đổi | Trạng thái trước | Trạng thái sau hiệu chỉnh | File ảnh hưởng |
| :--- | :--- | :--- | :--- |
| **Trạng thái đơn thành công** | `PAYMENT_SUCCESS` | `APPROVED` | [DormitoryApplication.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplication.java) |
| **Cấu trúc Bill đăng ký** | Gộp chung thành 1 Bill | Tách biệt hóa đơn phòng (`ACCOMMODATION_FEE`) và hóa đơn cọc (`DEPOSIT_FEE`) | [Bill.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Bill.java) |
| **Trạng thái tài khoản** | `PENDING_ACTIVATION` | Xác nhận giữ nguyên `PENDING_ACTIVATION` | [UserAccount.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/user/entity/UserAccount.java) |

---

## FINAL DECISION

**PAYMENT-02 PASS**
*(Hồ sơ hiệu chỉnh kiến trúc đã được đồng bộ hoàn toàn với Domain SDMS hiện tại. Sẵn sàng chuyển giao sang bước lập trình thực tế tại `PAYMENT-03`).*
