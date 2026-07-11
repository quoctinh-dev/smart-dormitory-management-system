# WORK LOGS DIRECTORY

## Mục đích (Purpose)
Thư mục này dùng để lưu trữ toàn bộ lịch sử công việc (Session History) sau mỗi phiên làm việc của các AI Agent và Developer. 
Đây là **nhật ký phát triển vĩnh viễn** của hệ thống, giúp các Agent và nhà phát triển ở các giai đoạn sau dễ dàng theo dõi được tiến trình xây dựng dự án, biết được tính năng nào đã được hoàn thiện vào ngày nào và những quyết định/kiểm toán kỹ thuật nào đã được thực thi.

## Phân biệt `work_logs/` và `handoff/`
- **`docs/handoff/`**: Nơi chứa tài liệu **bàn giao ngắn hạn** giữa 2 ca làm việc liên tiếp. Tài liệu ở đây (`HANDOFF_SUMMARY.md`) sẽ thường xuyên bị ghi đè bởi Agent trước khi kết thúc ca làm việc để Agent vào sau nắm được ngay trạng thái hiện tại.
- **`docs/work_logs/`**: Nơi chứa tài liệu **lưu trữ vĩnh viễn**. Các file trong thư mục này được lưu lại như những cột mốc lịch sử, tuyệt đối không được ghi đè hay xóa bỏ, giúp theo dõi tiến độ đường dài.

## Quy tắc tạo Log (Naming Convention)
- Tên file bắt buộc tuân thủ định dạng: `session_YYYY_MM_DD.md` (ví dụ: `session_2026_07_07.md`).
- Nếu trong một ngày có nhiều phiên hoặc xử lý nhiều tính năng lớn riêng biệt, có thể gắn thêm hậu tố (ví dụ: `session_2026_07_07_part2.md`).
- **Nội dung bắt buộc:** 
  - Thời gian của phiên làm việc.
  - Các công việc/tính năng/lỗi đã hoàn thành.
  - (Tùy chọn) Ghi chú về các quyết định cấu trúc/kiến trúc quan trọng được đưa ra trong phiên đó.

> **⚠️ Lời nhắc cho các AI Agent:** Theo Đạo luật "SESSION HISTORY RULE", trước khi kết thúc phiên làm việc hiện tại, bạn có nghĩa vụ phải tạo một file log mới trong thư mục này để tóm tắt các tác vụ đã thực hiện thành công.
