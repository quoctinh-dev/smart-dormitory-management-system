# Hướng dẫn tích hợp Thanh toán tự động (SePay) cho Mobile App

Backend vừa được tái cấu trúc để sử dụng **MỘT quy chuẩn duy nhất** cho việc thanh toán (cả mã QR tự động lẫn chuyển khoản thủ công).
Quy chuẩn này được áp dụng cho toàn bộ các loại hóa đơn (Đăng ký mới, Gia hạn, Điện nước, v.v.).

Mobile App Team vui lòng thực hiện UI/UX theo các yêu cầu sau:

## 1. Quy chuẩn Mã Giao Dịch (Transaction Code)
- Để hệ thống SePay tự động gạch nợ, cú pháp chuyển khoản **BẮT BUỘC** phải là: `SDMS` + `8 ký tự đầu của billId (viết hoa)`.
- Ví dụ: Nếu `billId` là `0ae9f057-727e-417c-ae94-f9357bcae395`, cú pháp chuyển khoản sẽ là: **`SDMS0AE9F057`**.

## 2. Luồng 1: Thanh toán bằng mã QR tự động (Khuyến khích)
Khi sinh viên chọn một hóa đơn và bấm nút "Thanh toán":
1. App gọi API: `POST /api/v1/payment/online` với body:
   ```json
   {
       "billId": "<UUID>",
       "amount": <Số tiền>,
       "paymentMethod": "BANK_TRANSFER"
   }
   ```
2. API sẽ trả về `PaymentResponse`, trong đó có trường `paymentUrl`.
   - Ví dụ `paymentUrl`: `https://qr.sepay.vn/img?acc=0819281512&bank=MBBank&amount=350000&des=SDMS0AE9F057`
3. Bản chất `paymentUrl` trả về trực tiếp **định dạng ảnh (image)**.
4. UI Mobile: Hiển thị 1 Popup/BottomSheet chứa Widget Image load trực tiếp URL này để sinh viên tải về máy hoặc dùng máy khác quét.

## 3. Luồng 2: Thanh toán thủ công (Copy cú pháp)
Ngay bên dưới hoặc bên cạnh mã QR, hãy hiển thị hướng dẫn chuyển khoản thủ công nếu sinh viên không thể quét QR:
- **Ngân hàng:** MBBank
- **Số tài khoản:** `0819281512` (Có nút copy)
- **Tên người nhận:** Tên chủ tài khoản hệ thống
- **Số tiền:** (Lấy từ hóa đơn)
- **Nội dung chuyển khoản (Cú pháp bắt buộc):** `SDMS` + `[8 ký tự đầu billId viết hoa]` (Có nút COPY). 
  - *Ví dụ UI: "Vui lòng copy chính xác cú pháp: SDMS0AE9F057"*

## 4. Kiểm tra trạng thái thanh toán (Polling/WebSocket)
- Phía Server đã tích hợp Webhook. Ngay khi sinh viên chuyển khoản thành công, Backend sẽ lập tức đối soát trong vòng 1-3 giây.
- Mobile App chờ nhận Push Notification từ Firebase để hiển thị thông báo "Thanh toán thành công" và refresh màn hình Hóa đơn.
