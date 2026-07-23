# TÀI LIỆU QUY TRÌNH TỔNG HỢP (MASTER PLAYBOOK)

Tài liệu này là Cẩm nang thực thi toàn diện, mô tả chính xác từng bước, từng người (Bạn, Vỹ, Technical AI, Writing AI) và từng câu lệnh Prompt cần dùng ở mỗi giai đoạn.

---

## GIAI ĐOẠN 1: KHỞI ĐỘNG HỆ THỐNG (BẮT ĐẦU PHIÊN LÀM VIỆC)
Mỗi khi bắt đầu một ngày làm việc mới hoặc mở trình duyệt mới:

*   **1.1. Khởi động Technical AI (BẠN LÀM):**
    *   Bạn mở chat với Antigravity (Tôi).
    *   Bạn copy toàn bộ nội dung trong file `THESIS/prompts/SYSTEM_PROMPT_ORCHESTRATOR.md` và gửi cho tôi.
    *   *Mục đích:* Ép tôi nạp lại luật (`AGENT.md`, `structure.md`) và thiết lập chế độ Audit.

*   **1.2. Khởi động Writing AI (VỸ LÀM):**
    *   Vỹ mở một đoạn chat mới trên ChatGPT hoặc Claude.
    *   Vỹ copy toàn bộ nội dung trong file `THESIS/prompts/SYSTEM_PROMPT_WRITER.md` và gửi cho ChatGPT.
    *   *Mục đích:* Ép ChatGPT đóng vai Thạc sĩ/Kỹ sư, bắt buộc hỏi văn cảnh và tuân thủ định dạng.

---

## GIAI ĐOẠN 2: AUDIT MÃ NGUỒN & TRÍCH XUẤT SỰ THẬT (TECHNICAL AI)
Đây là giai đoạn đào bới Source Code để tìm ra dữ liệu thật.

*   **Hành động của BẠN:**
    Bạn gửi cho tôi một câu lệnh. Ví dụ: *"Hãy dùng công cụ read (view_file) để audit luồng Đăng nhập (Login). Từ Frontend React xuống Spring Boot Backend."*
*   **Hành động của TÔI (Technical AI):**
    1.  Tôi **BẮT BUỘC** phải dùng tool `view_file`, `grep_search`, `list_dir` để mò vào code thật. Tuyệt đối không phỏng đoán.
    2.  Tôi xuất ra file `THESIS/outputs/audit_login.md` (Chứa API thật, bảng DB thật).
    3.  Tôi xuất ra file `THESIS/prompts/viet_login.md` (Chứa câu lệnh ra việc cho Vỹ).

---

## GIAI ĐOẠN 3: DỊCH THUẬT HÀN LÂM (WRITING AI)
Đây là giai đoạn chuyển số liệu khô khan thành Báo cáo tốt nghiệp đẹp mắt.

*   **Hành động của VỸ:**
    1. Vỹ mở file `prompts/viet_login.md` mà tôi vừa tạo, copy nội dung của nó.
    2. Vỹ dán vào con ChatGPT (đã khởi động ở GĐ 1).
    3. Con ChatGPT sẽ đòi: *"Hãy đưa tôi đoạn cuối của phần trước để tôi viết nối tiếp"*. Vỹ copy 2-3 câu của phần trước thả vào cho nó.
    4. ChatGPT nhả ra bài văn hoàn chỉnh và mã sơ đồ Mermaid.
    5. Vỹ lưu bài văn đó thành file `THESIS/outputs/draft_login.md`.

---

## GIAI ĐOẠN 4: REVIEW KIỂM DUYỆT CHÉO (TECHNICAL AI)
Đảm bảo Writing AI không "chém gió" bậy bạ.

*   **Hành động của BẠN:**
    Bạn yêu cầu tôi (Technical AI): *"Hãy dùng view_file đọc file `THESIS/outputs/draft_login.md` của Vỹ và đối chiếu với file `audit_login.md`. Báo cho tôi biết nếu có lỗi sai lệch."*
*   **Hành động của TÔI:**
    Tôi kiểm tra. Nếu OK, tôi báo *"Đã duyệt"*. Nếu có lỗi (VD: Writing AI tự chế ra cái table không có thật), tôi yêu cầu Vỹ bắt ChatGPT viết lại đoạn đó.

---

## GIAI ĐOẠN 5: XUẤT BẢN VÀO WORD (PYTHON AUTOMATION)
Đưa nội dung vào tài liệu chính thức.

*   **Hành động của VỸ:**
    1. Mở Terminal / PowerShell.
    2. **(BẮT BUỘC) Backup file Word trước khi sửa:**
       ```bash
       python THESIS/scripts/backup.py
       ```
    3. Chạy lệnh chèn nội dung:
       ```bash
       python THESIS/scripts/update_doc.py --input THESIS/outputs/draft_login.md --target THESIS/thesis.docx --heading "Sơ đồ tuần tự"
       ```
    3. Mở file Word ra, bôi đen đoạn vừa chèn, chọn Style `Normal` (nếu bị lệch font).
    4. Lấy mã Mermaid dán lên web tạo ảnh PNG và kéo thả vào Word.

---

## GIAI ĐOẠN 6: LUẬT DỌN DẸP RÁC (CLEANUP & GARBAGE COLLECTION)
Để tránh thư mục `outputs` và `prompts` bị phình to với hàng trăm file rác, tuân thủ nguyên tắc "Làm xong xóa ngay".

*   **Hành động của BẠN:**
    *   Ngay sau khi Vỹ đã chèn thành công nội dung của tính năng đó vào file Word `thesis.docx` và xác nhận không cần sửa gì thêm.
    *   Bạn ra lệnh cho tôi (Technical AI): *"Hãy xóa các file audit, prompt và draft của phần X đi"*.
    *   Tôi sẽ lập tức xóa sạch các file tạm đó để giữ thư mục làm việc luôn gọn gàng (Chỉ giữ lại file Word và các file Luật).

**[HOÀN THÀNH 1 TÍNH NĂNG - QUAY LẠI GIAI ĐOẠN 2 CHO TÍNH NĂNG TIẾP THEO]**
