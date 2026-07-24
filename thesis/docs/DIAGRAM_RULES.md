# QUY TẮC THIẾT KẾ VÀ VẼ SƠ ĐỒ LUẬN VĂN (DIAGRAM RULES)

Tài liệu này quy định các tiêu chuẩn tối cao khi phân tích nghiệp vụ và vẽ sơ đồ cho toàn bộ cuốn Luận văn, nhằm đảm bảo tính hàn lâm, sự súc tích và phân bạch rõ ràng giữa Nghiệp vụ (Business) và Kỹ thuật (Technical).

## 1. DÒNG CHẢY LOGIC (THE LOGICAL FLOW)
Mọi sơ đồ phải được sinh ra theo đúng trình tự nhân quả, không nhảy cóc:
`Nghiệp vụ thực tế (Thủ công)` ➡️ `Nghiệp vụ đề xuất (Ứng dụng)` ➡️ `Cây chức năng` ➡️ `Use Case Tổng quát` ➡️ `Use Case Chi tiết (Bảng mô tả)` ➡️ `Sơ đồ Tuần tự (Sequence)` ➡️ `Sơ đồ Hoạt động (Activity / Thuật toán)`.

## 2. PHÂN TÁCH ĐỐI TƯỢNG ĐỘC GIẢ (AUDIENCE SEPARATION)
Bắt buộc tách bạch ranh giới ngôn ngữ giữa 2 chương:
*   **Chương 2 (Phân tích Yêu cầu):** Dành cho KHÁCH HÀNG (Ban QL, Sinh viên). Sử dụng ngôn ngữ đời thường, quy trình dễ hiểu. Chỉ dùng Use Case và Sơ đồ luồng nghiệp vụ cơ bản. Tuyệt đối không đưa thuật ngữ Code, Database, hay API vào đây.
*   **Chương 3 (Thiết kế Chi tiết):** Dành cho KỸ SƯ / HỘI ĐỒNG. Tập trung giải quyết bài toán "Làm như thế nào" (How). Phải chứa Sơ đồ Tuần tự, Sơ đồ Thuật toán AI, Sơ đồ Mạch điện, Kiến trúc Clean Architecture. Ngôn ngữ phải mang tính học thuật và kỹ thuật sâu.

## 3. CHIẾN LƯỢC TÁCH CÂY CHỨC NĂNG VÀ USE CASE
Dựa trên `PERMISSION_MATRIX.md`, hệ thống phải được chia làm 2 cây rành mạch:
*   **Nhánh Admin:** Quản trị toàn hệ thống, cấu hình phần cứng, duyệt yêu cầu.
*   **Nhánh Student:** Trải nghiệm người dùng, tra cứu, gửi yêu cầu, tương tác thiết bị.

## 4. CHIẾN LƯỢC PHÂN BỔ VÀO PHỤ LỤC (APPENDIX STRATEGY)
- **Vấn đề:** Đồ án có quá nhiều tính năng (4 mặt tiền Web/App, IoT, AI), nếu nhét hết sơ đồ và hình ảnh vào Chương 3 sẽ làm luận văn dài 200-300 trang, gây loãng nội dung cốt lõi và làm hội đồng mệt mỏi.
- **Giải pháp:**
  - **Chương 3 (Main Body):** CHỈ chứa Sơ đồ kiến trúc, Sơ đồ của các luồng CỐT LÕI (Nhận diện AI, Thanh toán, IoT mở cửa) và Ảnh chụp màn hình các tính năng đỉnh nhất. Giới hạn khoảng 120-150 trang cho toàn bộ nội dung chính.
  - **Phụ Lục (Appendix):** Đẩy TOÀN BỘ các sơ đồ Use Case chi tiết của tính năng phụ (CRUD sinh viên, phòng...), ảnh chụp màn hình các form nhập liệu cơ bản, và tài liệu cấu hình phần cứng xuống phần Phụ Lục ở cuối luận văn.

## 5. CHIẾN LƯỢC GIỚI HẠN SƠ ĐỒ (BẢNG MÔ TẢ VS SƠ ĐỒ)
Chiến lược này nhằm đáp ứng yêu cầu của nhà trường nhưng không làm loãng luận văn:
1.  **Tính Đầy Đủ ở Bảng Mô Tả:** Mục *Sơ đồ Use Case chi tiết* phải có Bảng mô tả liệt kê 100% tất cả các chức năng. Bảng này sẽ mô tả cặn kẽ cả các chức năng CRUD (Thêm, Sửa, Xóa) lẫn Nghiệp vụ chính. Nhờ có bảng này bao sân, ta không sợ bị thiếu tính năng.
2.  **Tính Đại Diện và Trọng Tâm ở Sơ Đồ:** Khi chuyển sang mục *Sơ đồ Tuần tự* và *Sơ đồ Hoạt động*, vì Bảng mô tả đã làm quá tốt nhiệm vụ giải thích CRUD rồi, nên ta được quyền LƯỢC BỎ sơ đồ của các chức năng CRUD. 
    *   Ta chỉ vẽ sơ đồ cho ĐÚNG 1 Module CRUD tiêu biểu để làm mẫu.
    *   Ghi chú rõ trong báo cáo: *"Các chức năng quản lý khác có luồng hoạt động tương tự như module mẫu, chi tiết đã được trình bày tại Bảng mô tả Use Case"*.
    *   Toàn bộ không gian còn lại DÀNH ĐỘC QUYỀN để vẽ sơ đồ cho các **Quy trình Core Business** (Xác thực khuôn mặt AI, Mở khóa IoT qua MQTT, Cảnh báo môi trường).

## 6. QUY TRÌNH THỰC THI (PROMPT WORKFLOW)
*   **Con người (Bạn):** Sẽ cung cấp Mẫu (Template) và Yêu cầu cụ thể cho từng sơ đồ.
*   **Technical AI:** Sẽ truy xuất Mã nguồn thực tế (Audit Code) ráp vào Template để sinh ra mã Mermaid logic, đảm bảo 100% sự thật kỹ thuật.
*   **Writing AI:** Chịu trách nhiệm diễn giải sơ đồ thành văn bản hàn lâm (Chuyển tiếp ngữ cảnh mượt mà).

## 7. QUY TẮC ĐỊNH DẠNG DRAW.IO XML CHO FLOWCHART (BUSINESS LOGIC)
Khi sinh mã XML cho công cụ Draw.io ở các sơ đồ Luồng nghiệp vụ (Flowchart Chương 2), AI phải tuân thủ tuyệt đối chuẩn định dạng sau:
1. **Khối hình thoi (Rhombus - Điều kiện):** Tuyệt đối để trống, KHÔNG GHI CHỮ bên trong.
2. **Khối mô tả điều kiện:** Đặt một khối hình chữ nhật (Rectangle) ngay bên trên khối hình thoi để ghi nội dung điều kiện (VD: "Kiểm tra hình thức thanh toán").
3. **Mũi tên đi vào hình thoi:** Phải là nét liền và KHÔNG CÓ đầu mũi tên (`endArrow=none`).
4. **Mũi tên rẽ nhánh từ hình thoi:** Phải có đầu mũi tên và BẮT BUỘC có Text Label (VD: "Hợp lệ", "Không hợp lệ", "Trực tiếp", "Trực tuyến").
5. **Điểm Kết thúc:** Toàn bộ sơ đồ chỉ có MỘT khối "Kết thúc" duy nhất. Tất cả các nhánh rẽ (dù là luồng thành công hay thất bại về mặt nghiệp vụ) đều phải hội tụ về điểm "Kết thúc" này để hoàn thành vòng đời quy trình. Quy tắc này khác biệt hoàn toàn với Sequence Diagram ở Chương 3 (nơi các lỗi sẽ văng ra Exception và kết thúc sớm - Early Return).

## 8. QUY TẮC MÀU SẮC & THẨM MỸ (VISUAL STYLING RULE)
- **Chuẩn học thuật (Trắng Đen):** Tất cả các sơ đồ (Flowchart, Use Case, Sequence, Activity...) khi sinh ra mã XML/Mermaid BẮT BUỘC phải là sơ đồ Trắng Đen (Black & White) để tuân thủ tính hàn lâm của Luận văn. 
- **Định dạng XML cụ thể:** Thuộc tính màu nền bắt buộc là `fillColor=#ffffff` và viền là `strokeColor=#000000`. Tuyệt đối không sử dụng các màu pastel (như `#e3f2fd`, `#fff3e0`) hay bất kỳ màu sắc loè loẹt nào khác trừ khi có yêu cầu đặc biệt. Khối Text thì sử dụng màu chữ đen mặc định.
