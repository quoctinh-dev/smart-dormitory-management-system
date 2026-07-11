# TÀI LIỆU TỔNG THỂ HỆ THỐNG SDMS (Smart Dormitory Management System)

Thư mục `docs/` này là nơi lưu trữ toàn bộ các tài liệu mang tính chất "Toàn cục" (Global) hoặc phi kỹ thuật (Non-technical) của dự án.
(Lưu ý: Tài liệu đặc tả kỹ thuật chuyên sâu của Backend, Frontend, IoT, AI sẽ nằm trong thư mục `docs/` tương ứng của từng project đó).

## Cấu trúc Thư mục

### 📁 `business/`
Nơi chứa các tài liệu liên quan đến Quy trình Nghiệp vụ (Business Workflows), Nhật ký gỡ lỗi nghiệp vụ (Changelogs), Biên bản họp. 
- *Ví dụ: `application_workflow_updates.md` chứa lịch sử giải quyết bài toán cấp phát giường và danh sách chờ.*

### 📁 `handoff/`
**Thư mục cực kỳ quan trọng dành cho AI Agents.** Nơi đây lưu trữ giao thức Bàn giao ca (Handover Protocol).
- **`HANDOFF_SUMMARY.md`**: Bản tóm tắt 100% tiến độ hiện tại, những lỗi vừa fix xong, và Nhiệm vụ tiếp theo.
- **`RESUME_PROMPT.md`**: Chứa đoạn lệnh mồi để người dùng gọi Agent mới thức dậy làm việc.
- **`PAUSE_PROMPT.txt`**: Lệnh yêu cầu Agent dừng công việc và tự động cập nhật lại `HANDOFF_SUMMARY.md`.

### 📁 `roadmap/`
Kho chứa các Ý tưởng / Định hướng tương lai (Future Plans). Thay vì bỏ xó ý tưởng vào một file Word nào đó, mọi dự định của SDMS đều được cấu trúc hóa để AI có thể đọc và tự hiểu cách triển khai.
- **`CREATE_FUTURE_PLAN_PROMPT.md`**: Copy nội dung file này đưa cho AI khi bạn có ý tưởng mới. AI sẽ tự động phân tích và sinh ra file đặc tả.
- **Thư mục `features/`**: Chứa các bản thiết kế của từng tính năng tương lai. *(Ví dụ: `01_AI_QUALITY_CHECKER.md` - Tính năng dùng OpenCV chấm điểm ảnh hưởng).*
