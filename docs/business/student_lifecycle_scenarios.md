``# PHÂN TÍCH VÒNG ĐỜI SINH VIÊN (STUDENT LIFECYCLE) VÀ XỬ LÝ CÁC KỊCH BẢN NGOẠI LỆ

Tài liệu này mô tả chi tiết Vòng đời trạng thái (State Machine Lifecycle) của một sinh viên từ khi bắt đầu nộp đơn đăng ký đến khi kết thúc lưu trú, bao gồm các kịch bản lặp lại theo chu kỳ học kỳ/năm học và các trường hợp ngoại lệ (Edge Cases) thường gặp trong thực tế quản lý Ký túc xá.

Hệ thống được thiết kế dựa trên nguyên lý **Phân tách thực thể (Entity Normalization)**, chia tách rõ ràng giữa **Trạng thái Sinh viên (StudentStatus)** và **Trạng thái Hợp đồng/Giường (AssignmentStatus)** để đảm bảo tính toàn vẹn dữ liệu.

---

## 1. MÔ HÌNH TRẠNG THÁI (STATE MACHINE)

### 1.1. Trạng thái Thực thể Sinh viên (`StudentStatus`)
Quản lý quyền hạn vật lý và truy cập hệ thống của sinh viên:
- **`PENDING_CHECKIN`**: Sinh viên đã hoàn tất thủ tục tài chính, đang chờ làm thủ tục nhận phòng thực tế.
- **`ACTIVE`**: Sinh viên đang cư trú hợp lệ, được cấp quyền ra vào cổng (Smart Access) và sử dụng App.
- **`INACTIVE`**: Sinh viên đã rời KTX (Trả phòng/Nghỉ học), bị thu hồi mọi quyền hạn.
- **`GRADUATED`**: Sinh viên đã ra trường, hồ sơ được lưu trữ vĩnh viễn.

### 1.2. Trạng thái Hợp đồng Thuê giường (`AssignmentStatus`)
Quản lý vòng đời của một đợt phân bổ phòng cụ thể:
- **`RESERVED`**: Đã xếp giường, đang chờ thanh toán (Giữ chỗ 3 ngày).
- **`PENDING_CHECKIN`**: Đã thanh toán, chờ nhận giường thực tế.
- **`OCCUPIED`**: Đang sử dụng giường.
- **`CHECKED_OUT`**: Đã trả giường thành công (Giải phóng chỗ cho người khác).
- **`EXPIRED` / `CANCELLED`**: Hủy giữ chỗ do quá hạn hoặc từ chối.

---

## 2. KỊCH BẢN 1: VÒNG ĐỜI CHUẨN (STANDARD FLOW)

Đây là kịch bản phổ biến nhất dành cho một Tân sinh viên bắt đầu nhập học và cư trú xuyên suốt năm học.

1. **Nộp đơn:** Sinh viên đăng ký qua Cổng Public (Website). Hệ thống bắt buộc sinh ra 2 tài liệu pháp lý: Đơn đăng ký & Bản cam kết (PDF).
2. **Xếp phòng & Giữ chỗ:** Admin duyệt đơn, hệ thống tạo Hợp đồng ở trạng thái `RESERVED`.
3. **Thanh toán:** Sinh viên đóng tiền (Hóa đơn đợt 1). Hợp đồng chuyển sang `PENDING_CHECKIN`. Hệ thống sinh tự động tài khoản người dùng (`UserAccount`) và cấu hình khuôn mặt ban đầu.
4. **Nhận phòng (Check-in):** Sinh viên đến quầy Lễ tân nhận chìa khóa. Lễ tân xác nhận trên hệ thống. 
   - *Hệ thống tự động:* Chuyển Hợp đồng thành `OCCUPIED`, chuyển Sinh viên thành `ACTIVE`, kích hoạt quyền ra vào cổng IoT.
5. **Trả phòng (Check-out):** Cuối năm, sinh viên làm thủ tục rời KTX.
   - *Hệ thống tự động:* Chuyển Hợp đồng thành `CHECKED_OUT`, chuyển Sinh viên thành `INACTIVE`, tự động hoàn trả Tiền Cọc (Deposit), vô hiệu hóa khuôn mặt tại cổng.

---

## 3. KỊCH BẢN 2: VÒNG LẶP GIA HẠN (EXTENSION LOOP)

Kịch bản dành cho sinh viên ĐANG cư trú (`ACTIVE` & `OCCUPIED`) muốn tiếp tục ở lại cho đợt Hè hoặc Năm học mới.

### 3.1. Gia hạn đợt Hè (Ngắn hạn <= 3 tháng)
- **Điều kiện:** Trạng thái phải đang là `OCCUPIED`. Không có nợ đọng (`hasDebts = false`).
- **Thực thi:** Sinh viên bấm nút "Gia hạn" trên Mobile App.
- **Xử lý ngầm:** Vì thời gian gia hạn <= 3 tháng và nằm trong cùng năm học, hệ thống **bỏ qua bước sinh PDF** nhằm tiết kiệm tài nguyên lưu trữ (Do bản cam kết đầu năm vẫn còn hiệu lực).

### 3.2. Gia hạn Năm học mới (Dài hạn > 3 tháng)
- **Điều kiện:** Trạng thái đang là `OCCUPIED`.
- **Thực thi:** Sinh viên gia hạn trên Mobile App cho 2 học kỳ tiếp theo (10 tháng).
- **Xử lý ngầm:** Vì tổng thời gian > 3 tháng (vượt quá một học kỳ/chuyển giao năm học), hệ thống **bắt buộc sinh lại 2 tài liệu PDF mới** để làm bằng chứng pháp lý cho chu kỳ cư trú tiếp theo.

---

## 4. KỊCH BẢN 3: CÁC TRƯỜNG HỢP NGOẠI LỆ (EDGE CASES)

Hệ thống được lập trình để tự động bẻ lái và xử lý các trường hợp cố tình lách luật hoặc phát sinh ngoài ý muốn.

### 4.1. Sinh viên bùng nợ bỏ đi (Debt Blocking)
- **Tình huống:** Sinh viên không đóng tiền Hóa đơn đợt 2 hoặc tiền điện nước, nhưng lại bấm xin Trả phòng (Check-out) để lấy lại Tiền cọc.
- **Xử lý:** Backend sẽ chặn giao dịch ngay lập tức bằng việc kiểm tra toàn bộ `BillRepository`. Nếu phát hiện `UNPAID` hoặc `OVERDUE`, tiến trình Trả phòng bị từ chối với thông báo In-app.
- **An ninh:** Quyền truy cập vật lý (Smart Access) không bị khóa để đảm bảo tính nhân văn (sinh viên vẫn được ra vào để đi học), nhưng thủ tục thanh lý hợp đồng bị đóng băng.

### 4.2. Rút hồ sơ, trả phòng giữa chừng (Early Check-out)
- **Tình huống:** Sinh viên đăng ký 6 tháng (Hệ thống đã sinh sẵn 2 Hóa đơn 3 tháng/đợt), nhưng mới ở 2 tháng đã xin rút hồ sơ.
- **Xử lý:** 
  - Tiền phòng đã đóng (Đợt 1) sẽ không được hoàn lại theo quy định. Tuy nhiên Tiền cọc sẽ được hoàn lại tự động qua sự kiện ngầm `DepositRefundListener`.
  - **Dọn dẹp nợ ảo:** Ngay khi Check-out thành công, sự kiện `StudentCheckedOutEvent` sẽ kích nổ. Listener tại module Thanh toán sẽ quét và **HỦY (CANCEL) toàn bộ các hóa đơn đợt sau (Đợt 2) đang ở trạng thái `UNPAID`**. Chống việc hệ thống gán nợ khống cho sinh viên sau khi đã rời đi.

### 4.3. Sinh viên "Mất tích" rồi quay lại lách luật (Break in Lifecycle)
- **Tình huống:** Sinh viên ở KTX năm nhất, sau đó Check-out ra ngoài sống (Năm 2). Đến đợt Hè Năm 3 đột ngột muốn vào lại KTX. Sinh viên này lên Mobile App để bấm Gia hạn.
- **Xử lý:**
  1. **Bị chặn ở App:** Vì đã Check-out từ năm 1, trạng thái của sinh viên là `INACTIVE` và Hợp đồng là `CHECKED_OUT`. Backend (`StayExtensionService`) sẽ chặn tính năng Gia hạn do yêu cầu bắt buộc phải là `OCCUPIED`.
  2. **Ép đi đường vòng:** Sinh viên buộc phải truy cập Website Public để đăng ký lại như một người lạ.
  3. **Tái sử dụng hồ sơ:** Khi thanh toán xong, hệ thống nhận diện Mã sinh viên (StudentCode) đã tồn tại. Thay vì tạo rác dữ liệu, hệ thống "đánh thức" hồ sơ cũ, chuyển trạng thái từ `INACTIVE` lên `PENDING_CHECKIN` và cập nhật hình ảnh khuôn mặt mới nhất.
  4. **Thiết lập lại Ràng buộc:** Vì đi qua luồng Public, hệ thống bắt buộc sinh ra 2 tài liệu PDF pháp lý mới (Dù chỉ ở 2 tháng Hè).
  5. **Bắt buộc Check-in vật lý:** Sinh viên phải đến gặp Lễ tân để nhận thẻ mới và Check-in. Lúc này trạng thái chính thức trở về `ACTIVE`. Vòng đời khép kín hoàn hảo.
