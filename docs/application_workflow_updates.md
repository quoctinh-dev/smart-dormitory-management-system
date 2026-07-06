# Báo cáo Cập nhật Luồng Nghiệp vụ Hồ sơ & Giường (Dormitory Application Workflow)

**Ngày cập nhật:** 05/07/2026
**Phạm vi:** Backend (Spring Boot), Frontend (React)

Tài liệu này tóm tắt lại toàn bộ các bản vá lỗi (bug fixes) và các tính năng nghiệp vụ (business features) đã được bổ sung nhằm đảm bảo tính toàn vẹn dữ liệu và tối ưu hóa trải nghiệm người dùng (UX) cho Sinh viên và Ban Quản lý (Admin) trong quá trình xét duyệt hồ sơ nội trú.

---

## 1. Vá lỗi Sinh file PDF (PDF Generation Issue)
* **Vấn đề:** Tính năng tự động tạo bản PDF Đơn đăng ký & Bản cam kết bị lỗi không nhận diện được font chữ Tiếng Việt, xuất hiện các thông báo lỗi `Font 'timesbd' with 'Cp1252' is not recognized` từ thư viện iText/Flying Saucer trên môi trường Windows.
* **Giải pháp:** 
  - Thay thế các file font bị lỗi bằng bộ font chuẩn Unicode (`times.ttf`, `timesbd.ttf`, `timesi.ttf`, `timesbi.ttf`).
  - Cập nhật hàm load font trong `ApplicationPdfService` để sử dụng đường dẫn tuyệt đối một cách chính xác (thay vì path tương đối có thể gây lỗi trên OS Windows).
* **Kết quả:** Hệ thống đã sinh thành công các file PDF tiếng Việt có dấu.

---

## 2. Vá lỗi Bỏ lỡ Sự kiện Danh sách chờ (WAITING_LIST Event Bug)
* **Vấn đề:** Khi một hồ sơ được nộp và phát hiện KTX đã hết giường (`BedReservationFailedEvent`), trạng thái hồ sơ vẫn kẹt ở `PENDING` thay vì chuyển sang `WAITING_LIST`.
* **Nguyên nhân:** Sự kiện này được bắn ra từ một luồng bất đồng bộ (`@Async` trong `RoomAllocationListener`) không gắn liền với một Transaction (Giao dịch DB) nào. Trong khi đó, người nghe sự kiện (`ApplicationEventListener`) lại dùng `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`. Do không có Commit nào xảy ra, sự kiện bị "nuốt" im lặng.
* **Giải pháp:** 
  - Đổi `@TransactionalEventListener` thành `@EventListener` thuần cho hàm `handleBedReservationFailed`.
  - Sử dụng `@Transactional(propagation = Propagation.REQUIRES_NEW)` để hàm tự mở một Transaction độc lập và cập nhật trạng thái hồ sơ an toàn.
* **Kết quả:** Trạng thái hồ sơ chuyển sang `WAITING_LIST` ngay lập tức nếu không còn giường dự kiến phù hợp.

---

## 3. Hoàn thiện Trải nghiệm UX cho Danh sách chờ (Waiting List Transparency)
* **Vấn đề:** Frontend chưa hỗ trợ hiển thị rõ ràng và giải thích trạng thái "Danh sách chờ", khiến sinh viên và Admin hoang mang.
* **Giải pháp (Frontend):**
  - Cập nhật UI components: `StatusIndicator`, `ApplicationReviewQueue`, `ApplicationReviewDetail`.
  - Bổ sung các dải ruy-băng thông báo (Alert Banners) màu xanh dương trên màn hình tra cứu của sinh viên (`StatusPage`). 
  - **Nội dung thông báo:** Giải thích rõ KTX tạm thời hết chỗ và hồ sơ sẽ tự động được thăng hạng (xếp phòng) nếu có người hủy ngang, giúp sinh viên yên tâm.

---

## 4. Bổ sung tính năng Tự động Chốt sổ Đợt đăng ký (Registration Period Closure Job)
* **Vấn đề:** Không có cơ chế kết thúc một Đợt đăng ký. Các sinh viên bị kẹt lại trong Danh sách chờ (`WAITING_LIST`) sẽ chờ đợi vô thời hạn, không biết bao giờ mới được báo rớt để đi tìm trọ ngoài.
* **Giải pháp (Backend):**
  - Tạo một Cron Job mới: `RegistrationPeriodClosureJob`.
  - **Lịch trình:** Chạy lúc 00:05 mỗi ngày.
  - **Nhiệm vụ:** Tìm các Đợt đăng ký đã hết hạn (`endDate < now`), đóng đợt đó lại (`isActive = false`) và tự động chuyển tất cả hồ sơ đang `PENDING`, `UNDER_REVIEW`, `WAITING_LIST` sang `REJECTED`.
  - **Ghi chú tự động:** Gắn lý do từ chối rõ ràng *"Đợt đăng ký đã kết thúc nhưng Ký túc xá vẫn không có phòng trống. Mong bạn thông cảm tìm trọ ngoài."*
* **Kết quả:** Giải quyết triệt để sự mông lung của sinh viên, chốt quyền lợi dứt khoát.

---

## 5. Bảo toàn Tài nguyên (Giường) khi Hủy / Hết hạn Bổ sung Hồ sơ
* **Vấn đề 1:** Khi Admin bấm nút "Từ chối" (Reject) một hồ sơ, trạng thái đổi thành `REJECTED` nhưng chiếc giường dự kiến của hồ sơ đó vẫn kẹt ở trạng thái `RESERVED` mãi mãi (Ghost Occupancy).
* **Vấn đề 2:** Khi Admin yêu cầu sinh viên "Bổ sung hồ sơ" (REQUEST_REVISION) và hẹn ngày chót (`revisionDeadline`), nếu sinh viên bỏ mặc không nộp lại, hồ sơ bị treo vĩnh viễn và cũng "giam" chiếc giường KTX.
* **Giải pháp (Backend):**
  - Cập nhật hàm `ApplicationReviewService.rejectApplication`: Ngay khi hồ sơ bị từ chối, lập tức gọi lệnh `cancelReservation` để chuyển giường thành `AVAILABLE`, giảm sĩ số phòng và nhường cơ hội cho người trong Danh sách chờ.
  - Tạo Cron Job mới: `RevisionDeadlineExpiryJob`. Chạy mỗi giờ một lần để quét các hồ sơ `REQUEST_REVISION` quá hạn. Nếu phát hiện, tự động Reject hồ sơ và nhả giường.
* **Kết quả:** 100% không còn tình trạng giường ảo, tài nguyên KTX được tối ưu tối đa.

---

## 6. Hiển thị Minh bạch Lý do Từ chối (Frontend Transparency for Rejections)
* **Vấn đề:** Khi bị Reject (bởi Admin hoặc bởi Bot chốt sổ), sinh viên lên web kiểm tra chỉ thấy chữ "Đã từ chối" mà không hiểu tại sao.
* **Giải pháp:**
  - Backend: Cập nhật object `ApplicationResponse` để mapping và gửi thêm trường `reviewNote` (Lý do/Ghi chú của người duyệt).
  - Frontend: Khai báo lại Type trong `useApplicationStatus.ts`. Cập nhật `StatusPage.tsx` hiển thị Khung báo lỗi màu đỏ (Error Alert) chứa nguyên văn lý do từ chối.
* **Kết quả:** Tăng cường sự chuyên nghiệp, giảm tải câu hỏi/khiếu nại từ sinh viên về cho Phòng Quản lý Ký túc xá.
