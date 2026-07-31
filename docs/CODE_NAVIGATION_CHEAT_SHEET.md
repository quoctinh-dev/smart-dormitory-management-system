# 🧭 BÍ KÍP TÌM CODE & VẼ LUỒNG NHANH (BẢN CẬP NHẬT INTELLIJ + SEQUENCE DIAGRAM)

Tài liệu này là "phao cứu sinh" giúp bạn tra cứu nhanh hoặc biểu diễn code trước hội đồng chỉ trong 3 giây. Kết hợp phím tắt IntelliJ và Plugin Sequence Diagram để thể hiện sự chuyên nghiệp.

---

## 🎯 1. VŨ KHÍ TỐI THƯỢNG: TRUY VẾT NHANH TRÊN INTELLIJ
- **Shift + Shift (Double Shift):** Gõ tên bất kỳ file, class, hoặc đường dẫn API (VD: `/api/v1/payment`). Công cụ mạnh nhất để tìm mọi thứ.
- **Ctrl + Alt + H (Call Hierarchy):** Đứng ở một Service (VD: `reserveBed`), bấm tổ hợp này để xem ngay Controller nào đang gọi nó. Rất tiện để trả lời câu: *"Tính năng này được gọi từ đâu?"*.
- **Ctrl + B (Go to Declaration):** Nhảy ngay vào ruột của một hàm để xem logic.
- **Alt + F7 (Find Usages):** Tìm xem class/hàm này đang được xài ở những đâu trong toàn dự án.
- **Right-click -> Sequence Diagram:** Vũ khí mới! Khi bị hỏi *"Luồng chạy của cái này thế nào?"*, hãy nhấp chuột phải vào tên hàm (VD: `processWebhook`) -> Chọn **Sequence Diagram** để show ngay sơ đồ cho hội đồng xem.

---

## 🔴 2. BACKEND (JAVA) - BẢNG TRA NHANH CÁC NGHIỆP VỤ LÕI

Dùng `Shift + Shift` gõ tên file dưới đây, sau đó bấm `Right-click -> Sequence Diagram` vào hàm tương ứng để ra ngay luồng:

| Nghiệp vụ / Câu hỏi Hội đồng | File cần mở (Double Shift) | Hàm & Cách xem luồng nhanh |
| :--- | :--- | :--- |
| **Xếp phòng & check giới tính** | `HousingAssignmentService` | Chuột phải vào `reserveBed(...)` -> Sequence Diagram. |
| **Gạch nợ tự động SePay** | `SepayService` | Chuột phải vào `processWebhook(...)` -> Xem luồng cắt chuỗi. |
| **Bắt sự kiện gạch nợ (Event)** | `PaymentIntegrationListener` | Chuột phải vào `handlePaymentSuccess(...)` -> Xem nhánh IF. |
| **Xác thực khuôn mặt AI kép** | `IotVerificationController` | Chuột phải vào `verifyCard(...)` -> Nó sẽ tự vẽ đường gọi sang `FaceVerificationService`. |
| **Dọn rác dữ liệu ban đêm** | `RoomOccupancyReconciliationJob`| Xem hàm `execute()` để hiểu luồng quét DB dọn giường. |
| **Sinh file PDF đăng ký** | `ApplicationPdfService` | Chuột phải vào `generateExtensionPdfs(...)` -> Vẽ luồng tạo PDF. |

---

## 🔵 3. FRONTEND & IOT - MỞ NHANH BẰNG DOUBLE SHIFT

**Frontend (React):**
- **Chuông thông báo UI:** Tìm `NotificationBell.tsx` (Logic icon và LineClamp).
- **Ghi điện nước:** Tìm `useUtilityReading.ts`.

**IoT & Hardware (ESP32):**
- **Quẹt thẻ RFID:** Tìm `rfid_handler.cpp` (hoặc `main.cpp`).
- **Phát còi & Mở cửa:** Tìm `hardware_control.cpp`.

**💡 TIP CHỐT HẠ KHI RA HỘI ĐỒNG:**
Mở sẵn 4 project (Backend, Frontend, AI, IoT) thành 4 cửa sổ. Khi bị vặn hỏi luồng code, hãy bình tĩnh `Alt + Tab` sang IntelliJ, gõ `Shift + Shift` tìm file, và **vẽ ngay Sequence Diagram** tại chỗ. Thái độ tự tin + Tool xịn sẽ thuyết phục hội đồng 100%!
