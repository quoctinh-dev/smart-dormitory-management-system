# HANDOFF SUMMARY (BÀN GIAO PHIÊN LÀM VIỆC)

## 1. TIẾN ĐỘ HIỆN TẠI (LATEST PROGRESS)
- Đã hoàn thành xuất sắc **8 Sơ đồ Quy trình nghiệp vụ (Flowcharts)** bằng định dạng XML (Draw.io) cho Mục 2.3.1 của Luận văn:
  1. `registration_flowchart.xml` (Đăng ký lưu trú)
  2. `extension_flowchart.xml` (Gia hạn lưu trú)
  3. `transfer_room_flowchart.xml` (Chuyển phòng)
  4. `payment_flowchart.xml` (Thanh toán phí - Tích hợp Webhook)
  5. `checkout_flowchart.xml` (Trả phòng)
  6. `access_control_flowchart.xml` (Kiểm soát ra vào - Tích hợp IoT/AI)
  7. `utility_billing_flowchart.xml` (Chốt chỉ số điện nước & tính tiền)
  8. `maintenance_flowchart.xml` (Bảo trì cơ sở vật chất)
- Đã cung cấp đầy đủ **Báo cáo Audit Code Backend** chứng minh logic nghiệp vụ cho toàn bộ 8 quy trình trên.
- Đã hoàn thiện văn bản cho mục 2.3.1, 2.3.2 trong file `thesis/outputs/draft_2.3.md`.

## 2. TRẠNG THÁI HIỆN TẠI (CURRENT STATE)
- Đang dừng ở cuối phần 2.3.1 (Các quy trình, nghiệp vụ). User yêu cầu nghỉ ngơi.

## 3. CÔNG VIỆC TIẾP THEO (NEXT STEPS)
- **Bắt tay vào làm Mục 2.3.3: Sơ đồ Use case tổng quát**.
- **Hành động đầu tiên của Agent tiếp theo:** Liệt kê danh sách các Tác nhân (Actors) và các Nhóm chức năng chính (Use Cases) để User duyệt trước khi tiến hành sinh mã XML.

## 4. QUY TẮC LÀM VIỆC BẮT BUỘC (USER'S STRICT PREFERENCES - MUST FOLLOW)
Incoming Agent **BẮT BUỘC** phải tuân thủ các quy tắc sau khi vẽ Sơ đồ (Draw.io XML) cho luận văn:
1. **Hình khối:** Tuyệt đối dùng hình chữ nhật vuông vức, không bo góc (THUỘC TÍNH: `rounded=0`).
2. **Màu sắc:** Trắng đen (White background, Black stroke). Không dùng màu mè.
3. **Font chữ:** Bắt buộc dùng `fontFamily="Times New Roman"`.
4. **Đường nối điều kiện:** Đường nối từ Khối Text mô tả điều kiện sang Khối hình thoi quyết định BẮT BUỘC phải là đường thẳng không có mũi tên (`endArrow=none`).
5. **Ngôn ngữ:** Dùng Ngôn ngữ Nghiệp vụ (Business Language), hướng tới người đọc bình thường. Tuyệt đối không dùng thuật ngữ kỹ thuật (như "Status PENDING", "Event triggered", "REST API") trong hình ảnh sơ đồ.
6. **Code is Truth:** Mọi sơ đồ phân tích thiết kế đều phải bám sát 100% logic đang chạy thật dưới Backend (Java Spring Boot). Agent phải đọc Code trước khi vẽ và luôn cung cấp Audit Code để chứng minh.
