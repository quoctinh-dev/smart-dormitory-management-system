# Hướng dẫn Luồng Nghiệp vụ Hệ thống SDMS
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này mô tả chi tiết các luồng nghiệp vụ end-to-end trong nền tảng SDMS, đã được đối chiếu và cập nhật để phản ánh đúng thực trạng mã nguồn hiện tại.

---

## 1. HÀNH TRÌNH CỦA SINH VIÊN (END-TO-END)
1.  **Kiểm tra tư cách hợp lệ:** Sinh viên kiểm tra xem CCCD của mình có đủ điều kiện đăng ký hay không (trong trường hợp đợt đăng ký có giới hạn đối tượng).
2.  **Tạo đơn nháp:** Sinh viên tạo một đơn đăng ký nháp mà không cần có tài khoản.
3.  **Tải lên giấy tờ:** Sinh viên tải lên các giấy tờ minh chứng để tính điểm ưu tiên (ví dụ: Giấy chứng nhận hộ nghèo).
4.  **Nộp đơn:** Sinh viên nộp đơn để Ban Quản lý Ký túc xá (Admin) xét duyệt.
5.  **Theo dõi trạng thái:** Sinh viên kiểm tra trạng thái đơn của mình thông qua Cổng thông tin công khai (trang `/status`).
6.  **Thanh toán:** Sau khi đơn được `Chấp thuận` (Approved), trạng thái sẽ chuyển thành `CHỜ THANH TOÁN` (WAITING_PAYMENT). Sinh viên xem hóa đơn đã được tạo và tiến hành thanh toán.
7.  **Kích hoạt tài khoản:** Sau khi thanh toán thành công, việc phân phòng cho sinh viên sẽ chuyển sang trạng thái `ĐÃ Ở` (OCCUPIED). Sinh viên kích hoạt tài khoản của mình bằng email và CCCD làm mật khẩu tạm thời.
8.  **Đăng ký khuôn mặt:** Sinh viên đăng nhập và tải lên ảnh chân dung của mình để sử dụng chức năng ra vào cổng thông minh.
9.  **Sinh hoạt tại KTX:** Sinh viên ra vào ký túc xá thông qua Cổng thông minh (bằng Khuôn mặt/RFID), được hệ thống đánh giá dựa trên các quy tắc về giờ giới nghiêm.

## 2. HÀNH TRÌNH CỦA QUẢN TRỊ VIÊN (ADMIN) (END-TO-END)
1.  **Thiết lập:** Admin đăng nhập vào Cổng thông tin quản trị. Tạo một Đợt đăng ký (Registration Period) và nhập danh sách sinh viên đủ điều kiện qua file Excel.
2.  **Xét duyệt đơn:** Admin xem hàng đợi các đơn cần duyệt (`Application Review Queue`). Admin xem xét giấy tờ, kiểm tra điểm ưu tiên. Admin có thể:
    *   **Chấp thuận (Approve):** Hành động này sẽ kích hoạt việc tạo một phân phòng (assignment) và một hóa đơn (bill) tương ứng.
    *   **Từ chối (Reject):** Đóng đơn đăng ký.
    *   **Yêu cầu bổ sung (Request Revision):** Gửi trả lại cho sinh viên để sửa lại giấy tờ.
3.  **Duyệt ảnh khuôn mặt:** Admin xem hàng đợi các ảnh khuôn mặt cần duyệt (`Face Approval Queue`). Admin chấp thuận các ảnh rõ nét, hành động này sẽ kích hoạt quy trình xử lý và tạo vector nhúng AI.
4.  **Vận hành:** Admin theo dõi Bảng điều khiển phòng (Room Dashboard) để biết tình trạng lấp đầy. Ghi nhận các khoản thanh toán thủ công. Xử lý các thủ tục Check-in/Check-out vật lý.

## 3. VÒNG ĐỜI ĐƠN ĐĂNG KÝ (APPLICATION LIFECYCLE)
```
[DRAFT] (Nháp) ← Sinh viên đang tạo đơn, tải giấy tờ
   │
   ↓ (Nộp đơn)
[PENDING] (Chờ duyệt) ← Chờ Admin xét duyệt
   │
   ├─> (Chấp thuận) ────────────> [WAITING_PAYMENT] (Chờ thanh toán)
   │                                  │
   │                                  ↓ (Thanh toán thành công)
   │                              [PAID] (Đã thanh toán) → Phân phòng chuyển sang `OCCUPIED`
   │
   ├─> (Từ chối) ─────────────> [REJECTED] (Bị từ chối)
   │
   ├─> (Yêu cầu bổ sung) ───> [REQUEST_REVISION] (Yêu cầu bổ sung) → (Sinh viên nộp lại) → [PENDING]
   │
   └─> (Hết phòng trống) ──> [WAITING_LIST] (Danh sách chờ)
                                      │
                                      ↓ (Khi có phòng trống / Job chạy)
                                [WAITING_PAYMENT] (Chờ thanh toán)
```

## 4. VÒNG ĐỜI PHÂN PHÒNG (ROOM ASSIGNMENT LIFECYCLE)
Phân phòng (Assignment) là thực thể liên kết một Sinh viên/Đơn đăng ký với một Giường (Bed).
```
[RESERVED] (Đã giữ chỗ) ← Đơn được chấp thuận. Chờ thanh toán.
   │
   ├─> (Thanh toán thành công + Đã Check-in)
   │    [OCCUPIED] (Đang ở)
   │       │
   │       ↓ (Sinh viên rời đi / Check-out)
   │    [TERMINATED] (Đã kết thúc)
   │
   └─> (Hóa đơn hết hạn / 3 ngày không thanh toán)
        [CANCELLED] (Đã hủy) → Giường (Bed) trở lại trạng thái `AVAILABLE` (Trống).
```

## 5. VÒNG ĐỜI THANH TOÁN (PAYMENT LIFECYCLE)
```
[UNPAID] (Chưa thanh toán) ← Được tạo tự động khi phân phòng ở trạng thái `RESERVED`.
   │
   ├─> (Thanh toán thành công)
   │    [PAID] (Đã thanh toán)
   │
   └─> (Quá hạn thanh toán)
        [OVERDUE] (Quá hạn) → Kích hoạt việc hủy Phân phòng (Assignment).
```

## 6. VÒNG ĐỜI RA VÀO THÔNG MINH (SMART ACCESS LIFECYCLE)
1.  **Kích hoạt:** Sinh viên đứng trước cổng. Thiết bị ESP32 chụp ảnh hoặc quét thẻ RFID.
2.  **Truyền tín hiệu:** ESP32 gửi một tin nhắn MQTT đến topic `sdms/gate/{gateId}/verify`.
3.  **Đánh giá phía Backend:**
    *   Kiểm tra tính duy nhất của tin nhắn (Idempotency check) qua bảng `processed_messages`.
    *   Sinh viên có phải là nội trú hợp lệ (trạng thái `OCCUPIED`) không?
    *   Có quy tắc giờ giới nghiêm (`curfew_policy`) nào đang hoạt động và chặn việc ra vào không?
    *   (Nếu là khuôn mặt) Dịch vụ AI có trả về điểm tương đồng cosine thấp hơn ngưỡng chấp nhận không?
4.  **Ra quyết định:** Backend quyết định `GRANTED` (Cho phép) hoặc `DENIED` (Từ chối).
5.  **Ghi log:** Backend ghi lại lịch sử ra vào vào bảng `access_history`.
6.  **Gửi lệnh:** Backend gửi tin nhắn MQTT đến topic `sdms/gate/{gateId}/decision`. ESP32 nhận lệnh và kích hoạt rơ-le để mở cửa.
