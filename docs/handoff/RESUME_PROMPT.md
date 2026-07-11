# RESUME PROMPT

Xin chào Agent mới, bạn vừa tiếp nhận lại dự án **Smart Dormitory Management System (SDMS) Monorepo**. Dưới đây là những bước BẮT BUỘC bạn phải làm trước khi viết bất kỳ dòng code nào:

## 1. ĐỌC CÁC TÀI LIỆU QUY TẮC BẮT BUỘC (MANDATORY AGENT RULES)
Dự án này sử dụng kiến trúc Monorepo phân mảnh nghiêm ngặt. Bạn MẶC ĐỊNH PHẢI ĐỌC các file sau bằng tool `view_file` để nắm luật chơi trước khi làm việc:
- **Luật chung:** Đọc `<MONOREPO_ROOT>/.agents/AGENTS.md`
- **Luật Backend (Nếu task đụng vào Java):** Đọc `sdms-backend/.agents/AGENTS.md`
- **Luật Frontend (Nếu task đụng vào React):** Đọc `sdms-frontend/.agents/AGENTS.md`
*(Cảnh báo: Tuyệt đối không được bỏ qua bước này. Nếu bạn bỏ qua, bạn sẽ phá vỡ quy chuẩn dự án).*

## 2. ĐỌC TÌNH TRẠNG HIỆN TẠI
- Đọc file `docs/handoff/HANDOFF_SUMMARY.md` để biết phiên làm việc trước vừa kết thúc ở đâu.

## 3. NHIỆM VỤ CHÍNH CHO PHIÊN NÀY
Người dùng hiện đang chuẩn bị triểns khai một trong các task sau (Hãy hỏi người dùng xem họ muốn bắt đầu từ đâu):
- **Task A:** Triển khai **Điều chuyển phòng khẩn cấp & Đồng bộ IoT** (Xử lý sự kiện tòa nhà/phòng bảo trì).
- **Task B:** Khởi tạo **Mobile App** (Dành cho sinh viên) và thiết lập môi trường.
- **Task C:** Xây dựng luồng **Đăng ký Ký túc xá** (Dựa trên khảo sát thực tế từ người dùng).

**Lệnh khởi động:** "Chào bạn, tôi đã đọc xong Handoff Summary và nắm rõ các quy tắc trong AGENTS.md. Các module cốt lõi về Quản lý Phòng (Building/Floor/Room/Bed) đã hoạt động tốt. Bạn muốn chúng ta bắt đầu Task nào trong 3 Next Tasks trên?"
