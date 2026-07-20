# THESIS AI ECOSYSTEM - SMART DORMITORY (SDMS)

Chào mừng đến với Hệ sinh thái AI Hỗ trợ Viết Luận văn. Thư mục `THESIS/` này đóng vai trò như một "Văn phòng ảo", chứa toàn bộ tài nguyên, luật lệ và công cụ để tổ chức quá trình viết báo cáo tốt nghiệp một cách chuyên nghiệp nhất.

## 🌟 BỐ CỤC THƯ MỤC (DIRECTORY STRUCTURE)

Dưới đây là sơ đồ "phòng ban" của hệ thống:

*   **`docs/` (Phòng Luật pháp & Tiêu chuẩn):**
    *   `AGENT.md`: Bộ luật tối cao chi phối hành vi của mọi AI tham gia dự án.
    *   `structure.md`: Khung Mục lục chuẩn của trường và thứ tự đóng quyển.
    *   `style.md`: Quy định Căn lề, Font chữ, định dạng Header/Footer, Caption.
*   **`prompts/` (Phòng Điều khiển AI):**
    *   `SYSTEM_PROMPT_ORCHESTRATOR.md`: Câu lệnh khởi động dành cho **Bạn** để đánh thức AI Kỹ thuật (Antigravity).
    *   `SYSTEM_PROMPT_WRITER.md`: Câu lệnh khởi động dành cho **Vỹ** để đánh thức AI Viết bài (ChatGPT/Claude).
*   **`outputs/` (Phòng Lưu trữ kết quả):** Nơi chứa báo cáo kỹ thuật thô (`audit.md`) và các bản nháp văn bản (`draft.md`).
*   **`scripts/` (Phòng Công cụ vật lý):** Chứa Script Python `update_doc.py` để chèn chữ tự động vào Word.
*   **`thesis.docx` (Sản phẩm cuối cùng):** File tài liệu Word nộp cho nhà trường.

---

## 🔄 TỔNG HỢP QUY TRÌNH HOẠT ĐỘNG (THE DUAL-PROCESS)

Hệ sinh thái này vận hành dựa trên cơ chế **Kiểm soát chéo 2 Lớp (Audit & Write)** nhằm đảm bảo Báo cáo vừa hay (hàn lâm) vừa đúng (kỹ thuật).

### LỚP 1: TRUY XUẤT SỰ THẬT KỸ THUẬT (Bạn + Technical AI)
1. **Khởi động:** Bạn dán lệnh `SYSTEM_PROMPT_ORCHESTRATOR.md` cho tôi.
2. **Ra lệnh:** Bạn chỉ định: *"Hãy phân tích luồng A"*.
3. **Thực thi:** Tôi lùng sục mã nguồn (Spring Boot, React, C++ IoT) và xuất ra 2 file: 
   - `outputs/audit_[luong_A].md`: Báo cáo sự thật kỹ thuật.
   - `prompts/viet_[luong_A].md`: Lệnh giao việc đã đóng gói sẵn cho Vỹ.

### LỚP 2: BIÊN TẬP VÀ ĐỊNH DẠNG (Vỹ + Writing AI)
4. **Khởi động:** Vỹ nạp `SYSTEM_PROMPT_WRITER.md` vào ChatGPT.
5. **Dịch thuật:** Vỹ quăng 2 file (Audit + Prompt) lấy từ Lớp 1 cho ChatGPT.
6. **Kiểm tra Văn cảnh:** ChatGPT BẮT BUỘC phải đòi Vỹ đoạn kết của mục lục trước đó để viết câu chuyển đoạn mượt mà (Context Continuity Rule).
7. **Bản nháp:** ChatGPT nhả ra file `outputs/draft_[luong_A].md` chứa văn phong hàn lâm và mã Mermaid sơ đồ.

### LỚP 3: KIỂM DUYỆT VÀ XUẤT BẢN (Bạn & Vỹ)
8. **Review:** Bạn và Tôi kiểm tra xem bản nháp có "chém gió" sai logic Code không.
9. **Publish:** Vỹ chạy Python Script `update_doc.py` để nhét bản nháp vào file `thesis.docx` an toàn, giữ nguyên định dạng của trường.

---

## 🚀 CÁCH BẮT ĐẦU DỰ ÁN NGAY BÂY GIỜ
Hãy mở thư mục `prompts/` và bắt đầu kích hoạt các AI của bạn!
