# 🧠 TÀI LIỆU HỌC TẬP CODE NGHIỆP VỤ LÕI (BẢN KIỂM TRA NHANH BẰNG IDE)

Tài liệu này được làm lại để bạn **vừa đọc vừa thao tác thực hành trực tiếp trên IntelliJ**. Hãy dùng plugin **Sequence Diagram** để tự học các luồng này.

---

## 🟢 LUỒNG 1: ĐĂNG KÝ VÀ TỰ ĐỘNG XẾP PHÒNG
*Bắt đầu từ lúc sinh viên nộp đơn đến lúc có giường.*

- **Bước 1: Quản lý Đơn (Trạng thái)**
  - Mở `DormitoryApplicationService.java`.
  - Dùng plugin vẽ Sequence Diagram cho hàm xử lý nộp đơn. Bạn sẽ thấy nó gọi DB kiểm tra Blacklist.
- **Bước 2: Xếp phòng tự động (Trái tim của luồng)**
  - Mở `HousingAssignmentService.java`.
  - Vẽ Sequence Diagram cho hàm `reserveBed`. Nhìn vào biểu đồ, bạn sẽ thấy nó quét DB tìm giường `AVAILABLE`, check `Gender`, và chuyển trạng thái giường sang `RESERVED`.
- **Bước 3: Sự kiện ngầm (Event)**
  - Tìm `ApplicationEventListener.java`. Nếu hết giường, logic đẩy vào danh sách chờ (`WAITING_LIST`) nằm ở đây.

---

## 🔵 LUỒNG 2: TÀI CHÍNH VÀ TỰ ĐỘNG GẠCH NỢ SEPAY
*Thanh toán không chạm 100%.*

- **Bước 1: Chia nhỏ hóa đơn (Chunking)**
  - Tìm `BillGenerationListener.java`. (Chia 1 năm thành 4 hóa đơn 3 tháng).
- **Bước 2: Hứng tiền từ Ngân hàng (Webhook)**
  - Mở `SepayService.java`. Vẽ Sequence Diagram cho `processWebhook`.
  - Biểu đồ sẽ chỉ ra: Lấy nội dung CK -> Dùng Regex cắt mã SDMS -> Khớp số tiền -> Cập nhật trạng thái `PAID`.
- **Bước 3: Quyết định Hợp đồng phòng**
  - Mở `PaymentIntegrationListener.java`.
  - Đây là điểm chốt chặn: Nó check xem Hóa đơn này là tiền điện nước (Bỏ qua hợp đồng) hay Hóa đơn giữ chỗ (Kích hoạt hợp đồng -> Đổi giường thành `OCCUPIED`).

---

## 🟣 LUỒNG 3: AN NINH KÉP IOT & AI (DUAL-AUTH)
*Mở cửa bằng thẻ RFID + Khuôn mặt.*

- **Bước 1: Hứng tín hiệu IoT**
  - Mở `IotVerificationController.java`. Nơi đây đón API từ mạch ESP32.
- **Bước 2: Quét thẻ RFID**
  - Xem `SmartAccessService.java`. Code check quyền mở cửa, tránh đi lạc sang tòa khác.
- **Bước 3: Gửi AI xử lý**
  - Từ Controller, nhấp chuột phải vẽ Sequence Diagram -> Bạn sẽ thấy nó gọi sang `FaceVerificationServiceImpl.java`.
  - Nó gọi HTTP sang Python FastAPI (`face_service.py`) để tính `Cosine Similarity`. Trả về True/False để quyết định bật còi hay mở cửa.

---

## 🟡 LUỒNG 4: BẢO TRÌ VÀ TỰ PHỤC HỒI (AUTO-HEALING)
*Xử lý rác dữ liệu tự động.*

- **Dọn giường rác (Ban đêm):** 
  - Mở `RoomOccupancyReconciliationJob.java`. 
  - Vẽ Diagram hàm `execute()` để xem cách hệ thống tự động reset giường lỗi ảo (Có báo có người nhưng không có hợp đồng).
- **Hủy đơn quá hạn:** 
  - Mở `ReservationExpiryJob.java`. 3 ngày không đóng tiền -> Hủy đơn.
- **Nhắc nợ hóa đơn tự động:**
  - Mở `BillReminderScheduler.java`. Tự động quét hóa đơn đến hạn/quá hạn vào buổi sáng và bắn sự kiện nhắc nhở về App sinh viên.

**💡 BÀI TẬP THỰC HÀNH:** Hãy dành 15 phút mỗi ngày, dùng chức năng Sequence Diagram vẽ ra cả 4 luồng này trên IDE, bạn sẽ hiểu dự án sâu sắc như chính tay bạn code từ đầu đến cuối!
