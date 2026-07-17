# Bàn giao trạng thái hệ thống (Handoff Summary)
**Ngày cập nhật cuối:** 2026-07-16

## Tình trạng hiện tại (Trạng thái Standby)
- Quá trình Setup (Thiết kế Kiến trúc) Hệ sinh thái AI viết luận văn (tại thư mục `THESIS/`) đã HOÀN TẤT 100%.
- Mọi quy định cốt lõi: Quy tắc Code is Truth (chống hallucination), Quy tắc Định dạng (từ file PDF), Quy tắc liên kết văn cảnh đều đã được chốt và ghim vào `THESIS/docs/AGENT.md`.
- Kịch bản vận hành hằng ngày (Master Playbook) chia 5 giai đoạn rõ ràng tại `THESIS/README_WORKFLOW.md`.
- User (Bạn / Tech Lead) đã yêu cầu lưu lại trạng thái để tạm nghỉ. Hệ thống đang ở trạng thái bảo lưu.

## Nhiệm vụ tiếp theo (Dành cho Agent kế nhiệm)
Khi User quay lại làm việc (bắt đầu một phiên mới), Agent kế nhiệm BẮT BUỘC thực hiện:
1. Chờ lệnh từ User yêu cầu khởi động Audit một luồng chức năng cụ thể (Ví dụ: Luồng đăng nhập, luồng quét thẻ RFID).
2. Khi nhận lệnh Audit, **PHẢI tuân thủ quy tắc ở mục 4 của `THESIS/docs/AGENT.md`** bằng cách dùng công cụ `view_file`, `grep_search` đọc sâu vào Source Code thực tế (Frontend, Backend, IoT) để lấy dữ liệu thật. Tuyệt đối không phỏng đoán logic.
3. Trích xuất thành công 2 file `outputs/audit_[tên].md` và `prompts/viet_[tên].md` để chuẩn bị giao cho Vỹ và Writing AI.
