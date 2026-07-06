# BUSINESS FAQ

## Purpose
Hỏi đáp nhanh các thắc mắc nghiệp vụ thường gặp, tránh giải thích lặp lại cho thành viên mới hoặc Hội đồng bảo vệ.

## Scope
Các nghiệp vụ phức tạp, dễ gây nhầm lẫn đã được implement trong Source Code.

## Source of Truth
Business Rules, Workflows, State Machines, và Decisions.

## Contents

**Q: Khi sinh viên thanh toán trễ hạn, chuyện gì xảy ra?**
A: `ReservationExpiryJob` chạy tự động quét các Bill quá hạn 3 ngày. `Assignment` → `EXPIRED`, `Bill` → `CANCELLED`, giường trả về `AVAILABLE`. Tham khảo Rule [BR-F01](./BUSINESS_RULES.md) và Workflow [WF-01](./BUSINESS_WORKFLOWS.md).

---

**Q: Tại sao phải tách biệt Hóa đơn (Bill) và Giao dịch thanh toán (Payment)?**
A: Một sinh viên có thể cố gắng thanh toán nhiều lần (rớt mạng, số dư không đủ, QR hết hạn). `Payment` riêng lưu vết từng nỗ lực mà không sửa `Bill` gốc. Tham khảo [BD-002](./BUSINESS_DECISIONS.md).

---

**Q: Sinh viên có thể tự thay đổi ảnh khuôn mặt không?**
A: Không tự thay trực tiếp. Sinh viên upload ảnh mới → `FaceProfile` → `PENDING`. Admin phải duyệt lại thì ảnh mới có hiệu lực. Nếu Admin từ chối → `REJECTED` → Student upload lại. Không có trạng thái trung gian nào khác. Tham khảo [WF-04](./BUSINESS_WORKFLOWS.md) và [SM-03](./STATE_MACHINES.md).

---

**Q: Chế độ Khẩn cấp (Emergency Override) hoạt động thế nào?**
A: Admin kích hoạt qua `EmergencyOverrideController`. Cờ In-memory được bật. `AccessEvaluationService` kiểm tra cờ này đầu tiên — nếu bật, bất kể thẻ ai, giờ nào, kết quả luôn là `GRANTED`. Tham khảo Rule [BR-S03](./BUSINESS_RULES.md).

---

**Q: Hệ thống ngăn chặn sinh viên xem/sửa dữ liệu của nhau như thế nào?**
A: API Student không nhận `studentId` từ Payload. Backend tự lấy từ JWT Token qua `SecurityContext`. Không có cách nào inject ID người khác qua request. Tham khảo Rule [BR-S01](./BUSINESS_RULES.md).

---

**Q: Tại sao Bill khởi đầu là `UNPAID` chứ không phải `PENDING`?**
A: Enum `BillStatus` trong source code dùng tên `UNPAID` (không phải `PENDING`). Đây là lựa chọn thiết kế: `UNPAID` mô tả chính xác trạng thái "chưa thanh toán" hơn. Tham khảo [SM-04](./STATE_MACHINES.md).

---

**Q: ESP32 có xử lý logic mở cửa không?**
A: Không. ESP32 chỉ đọc thẻ/ảnh và gửi lên Server. Server quyết định `GRANTED`/`DENIED` và trả về. ESP32 chỉ chấp hành lệnh. Tham khảo [BA-002](./BUSINESS_ASSUMPTIONS.md) và [WF-05](./BUSINESS_WORKFLOWS.md).

---

**Q: Việc tính tiền điện hoạt động tự động thế nào?**
A: `ElectricityUsageScheduler` chạy lúc 0h ngày cuối tháng (`cron: 0 0 0 L * ?`). Tạo bản ghi `ElectricityUsage` cho mỗi phòng. Phát `ElectricityBillCalculatedEvent`. `ElectricityBillListener` tạo `Bill` loại `ELECTRIC_FEE`. Tham khảo [WF-07](./BUSINESS_WORKFLOWS.md).

---

**Q: Sự khác biệt giữa `REJECTED` và `REVOKED` trong FaceProfile là gì?**
A: `REJECTED` = Admin từ chối ảnh lúc đang `PENDING` (ảnh kém chất lượng). `REVOKED` = Admin thu hồi quyền của profile đang `APPROVED` (vi phạm nội quy). Tham khảo [SM-03](./STATE_MACHINES.md).

## Related Documents
- [README](./README.md)
- [BUSINESS_RULES](./BUSINESS_RULES.md)
- [BUSINESS_WORKFLOWS](./BUSINESS_WORKFLOWS.md)
- [STATE_MACHINES](./STATE_MACHINES.md)
- [BUSINESS_DECISIONS](./BUSINESS_DECISIONS.md)
- [BUSINESS_ASSUMPTIONS](./BUSINESS_ASSUMPTIONS.md)
