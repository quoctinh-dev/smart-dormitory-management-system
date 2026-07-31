# KỊCH BẢN DEMO BẢO VỆ LUẬN VĂN: "VÒNG ĐỜI SINH VIÊN" (KÈM TRÌNH DIỄN CODE TẠI CHỖ)

Kịch bản này được tối ưu lại. Kết hợp giữa việc **Demo trên Web/App** và **Bật IntelliJ vẽ Sequence Diagram ngay tại chỗ** để "Flex" (khoe) kỹ năng đọc hiểu mã nguồn với Hội đồng.

---

## 1. TÂN SINH VIÊN NHẬP HỌC (XẾP PHÒNG TỰ ĐỘNG)
- **Hành động:** Demo đăng ký và được hệ thống tự động xếp giường.
- **Khi Thầy/Cô hỏi:** *"Thuật toán nào xếp phòng mà không bị nhầm nam/nữ?"*
- **Tuyệt chiêu Trình diễn IDE:**
  1. `Alt + Tab` sang IntelliJ.
  2. Bấm `Shift + Shift` gõ `HousingAssignment`.
  3. Tìm đến hàm `reserveBed`. Bấm chuột phải chọn **Sequence Diagram**.
  4. **Thuyết minh:** *"Dạ thầy/cô xem luồng trên màn hình. Thuật toán của em tự động quét giường `AVAILABLE`, check `Gender`, và ngay lập tức khóa giường lại (`RESERVED`) bằng Database Transaction để chống đụng độ."*

## 2. KÝ HỢP ĐỒNG & THANH TOÁN (SEPAY WEBHOOK)
- **Hành động:** Mở Postman giả lập chuyển khoản ngân hàng -> Hóa đơn tự động cập nhật "Đã thanh toán" trên màn hình sinh viên.
- **Khi Thầy/Cô hỏi:** *"Làm sao biết người chuyển khoản là ai? Lỡ có sự cố mạng lúc gạch nợ thì sao?"*
- **Tuyệt chiêu Trình diễn IDE:**
  1. `Shift + Shift` tìm `SepayService`.
  2. Vẽ Sequence Diagram cho `processWebhook`.
  3. **Thuyết minh:** *"Hệ thống dùng Regex tách mã SDMS từ nội dung chuyển khoản. Đặc biệt, luồng này bọc trong `@Transactional`. Nếu gạch nợ xong mà lỗi lúc cấp phòng, nó sẽ Rollback toàn bộ trạng thái để đảm bảo an toàn tài chính tuyệt đối."*

## 3. AN NINH KÉP IOT & AI (ĐIỂM NHẤN CỦA LUẬN VĂN)
- **Hành động:** Quẹt thẻ đúng người -> Cửa mở. Quẹt thẻ người khác (gian lận) -> Còi hú đỏ.
- **Khi Thầy/Cô hỏi:** *"Hệ thống kết hợp AI với IoT ở đoạn code nào?"*
- **Tuyệt chiêu Trình diễn IDE:**
  1. Mở `IotVerificationController`.
  2. Dùng phím tắt `Ctrl + Alt + H` (Call Hierarchy) để cho thầy cô thấy đường đi của API từ phần cứng lên.
  3. Vẽ Sequence Diagram cho `verifyCard`.
  4. **Thuyết minh:** *"Khi mạch gửi UUID thẻ lên, Backend gọi Sidecar AI Python. AI dùng DeepFace tính khoảng cách Cosine khuôn mặt. Nếu nhỏ hơn ngưỡng, nó ném thẳng exception 400 khóa quyền ngay tại Controller, độ trễ chỉ tính bằng mili-giây."*

## 4. TỰ PHỤC HỒI DỮ LIỆU (AUTO-HEALING)
- **Hành động:** Demo hệ thống chạy qua ngày mà không bị kẹt giường.
- **Khi Thầy/Cô hỏi:** *"Dữ liệu bị lỗi bất đồng bộ giữa các bảng thì xử lý sao?"*
- **Tuyệt chiêu Trình diễn IDE:**
  1. Mở `RoomOccupancyReconciliationJob`.
  2. Chỉ vào dòng `@Scheduled(cron = "0 0 2 * * ?")`.
  3. **Thuyết minh:** *"Hệ thống có các Bot dọn rác chạy ngầm lúc 2h sáng. Giường nào báo có người mà không có hợp đồng sẽ tự bị thu hồi. Đây là tiêu chuẩn Data Consistency của hệ thống lớn."*

---
**🔥 TÂM PHÁP KHI BẢO VỆ:** 
Đừng chỉ đứng nói suông. Cứ mỗi lần giải thích một cơ chế phức tạp, hãy **bật Sequence Diagram lên**. Việc bạn làm chủ hoàn toàn IDE và luồng dữ liệu sẽ giúp bạn lấy điểm tối đa ở tiêu chí "Hiểu sâu kiến trúc phần mềm"!
