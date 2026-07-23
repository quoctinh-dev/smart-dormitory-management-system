# SỔ TAY Ý TƯỞNG LUẬN VĂN (THESIS IDEAS BACKLOG)

Tài liệu này dùng để lưu trữ các ý tưởng, chiến lược hoặc ghi chú chợt lóe lên trong quá trình làm việc từ trên xuống (Top-Down). 
Khi tiến hành viết đến các chương tương ứng, AI sẽ BẮT BUỘC phải đọc file này trước tiên để không bỏ sót bất kỳ ý tưởng đắt giá nào.

---

## 📌 CHƯƠNG 3: THIẾT KẾ (DESIGN)
- [ ] **Bảng mô tả Use Case:** Phải liệt kê đầy đủ 100% các module đã quét ở Backend (bao gồm Quản lý cơ sở vật chất, Xếp phòng, Đơn từ, Dashboard, Thông báo, Phân quyền).
- [ ] **Sơ đồ tuần tự (Sequence) & Hoạt động (Activity):** TUYỆT ĐỐI không vẽ cho từng chức năng CRUD lặt vặt. Chỉ chọn đúng 1 luồng CRUD làm đại diện.
- [ ] **Trọng tâm sơ đồ:** Dành 80% không gian để vẽ thật sâu 3 luồng cốt lõi: 
    1. Thuật toán tự động xếp phòng (Housing Assignment).
    2. Giao tiếp IoT & AI FaceNet mở khóa cổng.
    3. Xử lý gạch nợ tự động chống trùng lặp (Idempotency) bằng Webhook SePay.

## 📌 CHƯƠNG 4: THỬ NGHIỆM (TESTING)
- [ ] **Kịch bản Test Hiệu năng:** Phải có kịch bản test chịu tải (Load testing) giả lập số lượng lớn sinh viên truy cập vào 2 khung giờ cao điểm: 06h30 sáng và 21h50 tối.
- [ ] **Kịch bản Test IoT/AI:** Đo lường độ trễ từ lúc quét mặt/thẻ RFID đến lúc Relay bật mở cửa (Mục tiêu chứng minh độ trễ < 1-2s để không gây kẹt cổng).
- [ ] **Kịch bản Ngoại lệ (Edge cases):** Test trường hợp mất WiFi (ESP32 hoạt động ra sao) và trường hợp Webhook SePay bị lỗi gửi thông báo 2 lần cùng một giao dịch.

## 📌 CHƯƠNG 5: KẾT LUẬN & HƯỚNG PHÁT TRIỂN
- [ ] **Hướng phát triển tương lai:** Đưa phân hệ **"Quản lý Kỷ luật / Khen thưởng"** và **"Quản lý Bảo trì cơ sở vật chất"** vào danh sách các tính năng sẽ nâng cấp tiếp theo. 
- [ ] **Lập luận (Justification):** Giải thích rằng do quy trình vật lý tại KTX hiện tại chưa được chuẩn hóa rõ ràng cho 2 nghiệp vụ này, nên luận văn ưu tiên dồn tài nguyên giải quyết các bài toán lõi trước. Sẽ mở rộng khi quy trình thực tế được ban quản lý thống nhất.
