# QUY TRÌNH KÝ DUYỆT VÀ TÍNH PHÁP LÝ HỒ SƠ LƯU TRÚ (PAPER WORKFLOW)

Tài liệu này mô tả chi tiết quy trình kết hợp giữa luồng xử lý trên phần mềm (System Workflow) và luồng xử lý giấy tờ vật lý (Paper Workflow) để đảm bảo tính pháp lý thực tế cho Đơn đăng ký lưu trú và Đơn gia hạn lưu trú của sinh viên KTX.

Tài liệu này cũng phục vụ làm luận điểm bảo vệ đồ án tốt nghiệp khi hội đồng đặt câu hỏi về "Tính pháp lý của tài liệu được sinh ra từ hệ thống".

---

## 1. BỐI CẢNH (CONTEXT)
- Hệ thống hỗ trợ sinh viên nộp đơn online, tự động điền form (auto-fill) và xuất ra file PDF (Phiếu đăng ký & Bản cam kết).
- Ban quản lý (Admin/Staff) phê duyệt hồ sơ online trên hệ thống.
- **Vấn đề đặt ra:** File PDF sinh ra từ hệ thống chưa có chữ ký số (Digital Signature), vậy làm sao để có giá trị pháp lý ràng buộc giữa sinh viên và Ký túc xá?

## 2. QUY TRÌNH XỬ LÝ HIỆN TẠI (GIẢI PHÁP CHO ĐỒ ÁN)
Đồ án áp dụng mô hình **Số hóa kết hợp chứng thực vật lý (Hybrid Paper-Digital Workflow)**. Đây là quy trình chuẩn mực và phổ biến nhất đang được áp dụng tại các trường đại học / KTX hiện nay.

### Bước 1: Khởi tạo và Phê duyệt trên phần mềm
1. Sinh viên nộp đơn (Đăng ký mới hoặc Gia hạn).
2. Hệ thống chuyển trạng thái đơn sang `PENDING`.
3. Admin kiểm tra hồ sơ hợp lệ và nhấn "Phê duyệt" (Approve) trên phần mềm.
4. Hệ thống tự động:
   - Đổi trạng thái sang `WAITING_PAYMENT`.
   - Sinh ra file PDF có **in sẵn tên Admin (Username)** tại mục "Phần xét duyệt" để xác định ai là người chịu trách nhiệm thao tác.
   - In sẵn tên Sinh viên tại mục "Người cam kết / Kính đơn".

### Bước 2: In ấn và Ký sống (Physical Signature)
1. Sinh viên xách hành lý đến Văn phòng Ban quản lý KTX để làm thủ tục nhận phòng.
2. Cán bộ KTX (Admin) tra cứu hệ thống, xác nhận sinh viên đã đóng tiền thành công.
3. Cán bộ KTX tải file PDF từ hệ thống (đã có đủ thông tin) và **in ra giấy (Hard copy)**.
4. **Sinh viên:** Lấy bút bi ký sống (ký tay) vào vị trí đã được in sẵn tên mình.
5. **Cán bộ KTX (Người duyệt):** Ký nháy / Ký chính thức bằng bút bi vào vị trí tên mình được in sẵn, sau đó **đóng mộc đỏ** (dấu mộc của Ban Quản lý KTX hoặc Nhà trường).

### Bước 3: Lưu trữ và Có hiệu lực pháp lý
- Tờ giấy đã có đầy đủ Chữ ký sống + Mộc đỏ chính là **Văn bản pháp lý duy nhất và có giá trị ràng buộc cao nhất**.
- Cán bộ KTX lưu trữ bản cứng vào tủ hồ sơ.
- (Tùy chọn) Cán bộ KTX có thể scan lại bản cứng này và upload ngược lên hệ thống để lưu trữ file mềm đối chứng.
- Giao chìa khóa phòng cho sinh viên.

## 3. Ý NGHĨA & ĐÁNH GIÁ (LUẬN ĐIỂM BẢO VỆ ĐỒ ÁN)
Khi bị hội đồng phản biện hỏi: *"Phần mềm chỉ xuất ra file PDF, vậy sinh viên chối bỏ trách nhiệm thì sao? Có giá trị pháp lý không?"*

**Câu trả lời chuẩn:**
- Phần mềm của chúng em tập trung giải quyết bài toán **Tự động hóa hành chính (Administrative Automation)**: Giúp sinh viên không phải mua hồ sơ giấy, không phải viết tay mỏi mệt và sai sót; giúp Ban quản lý không phải gõ lại data vào Excel.
- Về tính pháp lý: File PDF do phần mềm sinh ra đóng vai trò là "Bản thảo đã chuẩn hóa thông tin" (Draft Document). Giá trị pháp lý được xác lập tại thời điểm sinh viên đến nhận phòng, **ký tay và đóng mộc đỏ** lên bản in của file PDF đó.
- Việc hệ thống in sẵn Tên sinh viên và Tên quản trị viên duyệt (Username) lên PDF giúp minh bạch hóa trách nhiệm, tránh tình trạng chữ ký tay không đọc được tên người ký.

## 4. HƯỚNG PHÁT TRIỂN TƯƠNG LAI (FUTURE WORKS - PAPERLESS HOÀN TOÀN)
Để nâng cấp hệ thống thành "Văn phòng không giấy" (Paperless Office) hoàn toàn, trong tương lai hệ thống cần:
1. **Tích hợp Chữ ký số Cấp trường (Server-side Digital Signature):** Khi Admin nhấn duyệt, hệ thống gọi API của nhà cung cấp CA (Certificate Authority) để đóng mộc điện tử (Digital Seal) lên file PDF.
2. **Tích hợp Chữ ký số Cá nhân (SmartCA/MobileCA):** Sinh viên sử dụng ứng dụng VNPT SmartCA / Viettel SmartCA trên điện thoại để ký số xác thực danh tính từ xa vào file PDF.
3. Khi đó, file PDF lưu trên Cloudinary sẽ mang đầy đủ tính pháp lý theo Luật Giao dịch điện tử hiện hành mà không cần in ra giấy.

---
**Tài liệu này được tạo ra để chuẩn hóa quy trình và định hướng lý luận cho Đồ án.**
