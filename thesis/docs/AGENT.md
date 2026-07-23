# LUẬT HỆ THỐNG CHO THESIS AI ECOSYSTEM (AGENT.md)

Tài liệu này là TỐI CAO cho mọi AI tham gia vào quá trình viết Luận văn SDMS. Mọi Subagent (Technical AI, Writing AI, Diagram AI) đều phải tuân thủ các quy tắc này.

## 1. QUY TẮC PHÂN CHIA VAI TRÒ (ROLE ISOLATION)
- **Technical AI (Orchestrator):** Chỉ làm nhiệm vụ truy quét mã nguồn (Audit Code) để tìm ra sự thật kỹ thuật. Không tự ý chỉnh sửa file Word.
- **Writing AI:** Chỉ làm nhiệm vụ nhận báo cáo kỹ thuật từ Technical AI và viết thành đoạn văn hàn lâm. Không tự ý chém gió hoặc "bịa" (hallucinate) tên API, bảng CSDL ngoài tài liệu Audit cung cấp.
- **Con Người (Bạn & Vỹ):** Bạn làm Tech Lead ra lệnh Audit. Vỹ làm Technical Writer chạy tool cập nhật Word và kiểm tra format.

## 2. QUY TẮC CHIỀU SÂU LUẬN VĂN (THESIS DEPTH RULE)
- **Cấm viết chi tiết mọi CRUD:** Báo cáo KHÔNG ĐƯỢC chứa các sơ đồ tuần tự, activity cho các luồng Quản lý danh mục cơ bản (Thêm/Sửa/Xóa tài khoản, phòng, tòa nhà...). Những thứ này chỉ được liệt kê dưới dạng bảng ở phần chức năng tổng quát.
- **Tập trung Core Business:** Chỉ tập trung phân tích SÂU (vẽ sequence, activity, exception handling) cho 3-5 luồng phức tạp nhất:
  1. Đăng ký & Xếp phòng (Logic Web)
  2. Tính toán & Thanh toán Hóa đơn tự động (Logic Tiền bạc)
  3. Quẹt thẻ từ RFID mở cửa (Logic IoT & Real-time)
  4. Cảnh báo sự cố nhiệt độ/môi trường (IoT Real-time)

## 3. QUY TẮC AUDIT "CHIA ĐỂ TRỊ" (STEP-BY-STEP AUDIT)
- Không bao giờ audit toàn bộ hệ thống cùng lúc để tránh quá tải ngữ cảnh (Context Overflow).
- **Micro-Auditing:** Thực hiện audit theo TỪNG LUỒNG (Use Case) cụ thể. Xong luồng này mới xuất file báo cáo rồi mới sang luồng khác.
- **Phạm vi đọc Code tiêu chuẩn:** Khi audit 1 luồng, Technical AI tập trung đọc:
  - Frontend: `pages`, `services/api` (Axios), `contexts` (State).
  - Backend: `Controller` (Đầu vào), `Service` (Nghiệp vụ chính).
  - Chỉ quét `Entity` (Database) hoặc `IoT Gateway` (MQTT) nếu chức năng đó thực sự cần thiết.

## 4. QUY TẮC "CODE IS TRUTH" (SỰ THẬT NẰM Ở MÃ NGUỒN)
- **CẤM PHỎNG ĐOÁN:** Technical AI BẮT BUỘC PHẢI SỬ DỤNG CÁC LỆNH ĐỌC FILE (`view_file`, `grep_search`, `list_dir`) để đọc trực tiếp Source Code khi thực hiện Audit. Tuyệt đối không được dùng "trí nhớ" hoặc suy đoán logic để viết báo cáo.
- Mọi mô tả, sơ đồ tuần tự (Sequence Diagram), tên biến, tên hàm, đường dẫn API phải KHỚP 100% với mã nguồn thực tế (Spring Boot, React, ESP32).
- Nếu phát hiện mâu thuẫn giữa Code hiện tại và thiết kế cũ, BẮT BUỘC lấy Code thực tế làm gốc.

## 5. QUY TẮC ĐỊNH DẠNG WORD (FORMATTING SAFETY)
- File `thesis.docx` phải được Con Người (Vỹ) thiết lập sẵn Template (Heading 1, Heading 2, Bìa, Mục lục, Font Times New Roman chuẩn).
- Tool Python `update_doc.py` chỉ chèn nội dung text. Nếu sau khi chèn bị lệch format, Vỹ phải bôi đen đoạn text đó trong Word và nhấn "Normal" hoặc gán lại Style tương ứng thủ công.
- Các sơ đồ UML (sinh ra từ mã Mermaid) BẮT BUỘC phải được render thành ảnh (PNG/JPG) trước khi Vỹ dán vào Word để tránh vỡ bố cục.

## 6. QUY TẮC LIÊN KẾT VĂN CẢNH (CONTEXT CONTINUITY RULE)
- Luận văn là một văn bản liền mạch, không phải là các mảnh ghép rời rạc.
- **BẮT BUỘC:** Khi tiến hành phân tích hoặc viết một Mục mới (Ví dụ: 3.2), các Agent (cả Technical AI và Writing AI) phải kiểm tra lại đoạn kết của Mục liền trước đó (Ví dụ: 3.1) để đảm bảo câu văn dẫn dắt logic, không bị lặp từ và không bị mâu thuẫn hệ thống.

## 7. QUY TẮC ĐỒNG BỘ TRÊN-DƯỚI (TOP-DOWN CONSISTENCY RULE)
- **Quy trình BẮT BUỘC mới:** Sau khi hoàn thành bất kỳ một mục hoặc một chương nào (phần dưới), Technical AI và Writing AI **PHẢI đối chiếu ngược lại** với nội dung cốt lõi đã chốt ở mục hoặc chương trước đó (phần trên).
- **Mục đích:** Tuyệt đối không để xảy ra tình trạng "đầu voi đuôi chuột" hoặc mâu thuẫn logic (Ví dụ: Phần 1 nói là không làm MoMo, nhưng xuống Phần 3 lại vẽ sơ đồ tích hợp MoMo; hoặc Phần 1 không nhắc gì đến Kỷ luật/Khen thưởng, nhưng Phần 2 lại phân tích yêu cầu cho Kỷ luật). Nội dung toàn bộ luận văn phải là một khối thống nhất từ trên xuống dưới.

## 8. QUY TẮC KẾ THỪA Ý TƯỞNG (BACKLOG INCLUSION RULE)
- **Quy trình BẮT BUỘC:** Trước khi bắt tay vào phân tích mã nguồn hoặc viết bản nháp cho một Chương mới (VD: Bắt đầu làm Chương 2, 3, 4, 5), Technical AI **BẮT BUỘC phải đọc file** `docs/THESIS_IDEAS_BACKLOG.md`.
- **Mục đích:** Đảm bảo mọi ý tưởng nảy sinh trong quá trình làm việc từ trên xuống (Top-Down) không bị rơi rụng. AI phải chủ động lấy các ý tưởng trong Backlog tương ứng với chương đang làm và lồng ghép chúng một cách logic vào nội dung hoặc sơ đồ chuẩn bị xuất bản.
