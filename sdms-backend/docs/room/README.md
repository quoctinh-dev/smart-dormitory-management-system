# ROOM MODULE (QUẢN LÝ CƠ SỞ VẬT CHẤT & PHÂN PHÒNG)

## 1. Mục đích
Thư mục này chứa toàn bộ các tài liệu cốt lõi về nghiệp vụ cho Module **Room** của Backend SDMS. Module này chịu trách nhiệm quản lý cây cơ sở vật chất (Tòa nhà -> Tầng -> Phòng -> Giường) và vòng đời lưu trú của sinh viên (Từ lúc giữ chỗ dự kiến đến khi trả phòng).

Tài liệu ở đây là **Single Source of Truth (SSOT)**, làm kim chỉ nam để lập trình viên Backend hiểu rõ các thực thể, các trạng thái vòng đời (State Machine), và các sự kiện (Events) tích hợp với các module khác.

## 2. Danh sách Tài liệu

| Tên File | Chức năng & Nội dung |
|---|---|
| `room-overview.md` | **Bức tranh tổng thể:** Cung cấp cái nhìn bao quát về chức năng của module Room, sơ đồ phân cấp dữ liệu cơ bản, và các điểm "bắt tay" (Integration points) với module Application, Payment, Student, SmartAccess thông qua Event. |
| `room-entity-model.md` | **Đặc tả Dữ liệu & Trạng thái:** Phân tích cực kỳ chi tiết về vòng đời của 1 cái Giường (`BedStatus`) và hợp đồng lưu trú (`AssignmentStatus`). Chỉ rõ sự kiện nào làm thay đổi trạng thái nào. |
| `SSR-RoomModule.md` | **Yêu cầu Chức năng (FR):** Danh sách các tính năng hệ thống bắt buộc phải có, bao gồm quản lý CRUD và các Job tự động (như tự động giữ chỗ, hủy chỗ, check-in). |

## 3. Nguyên tắc Đọc và Cập nhật
- Đọc theo thứ tự: `Overview` -> `Entity Model` -> `SSR`.
- **Tuyệt đối không lưu tài liệu API ở đây**. Mọi tài liệu liên quan đến API Controller của module Room phải được chuyển về thư mục `docs/api/`.
- Khi có sự thay đổi về quy trình kinh doanh (Business Logic) liên quan đến Giường hoặc Xếp phòng, lập trình viên phải cập nhật đồng bộ các file trong thư mục này trước khi viết code.
