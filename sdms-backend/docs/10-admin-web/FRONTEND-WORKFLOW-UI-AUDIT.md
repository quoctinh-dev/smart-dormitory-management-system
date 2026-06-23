# SDMS FRONTEND WORKFLOW & UI INTEGRATION AUDIT

## CONTEXT
**Dự án:** Smart Dormitory Management System (SDMS)  
**Trạng thái Backend:** PASS (Database Freeze, Architecture Freeze, Payment PASS, Face Governance Freeze).  
**Vấn đề:** Frontend Team đang mất phương hướng về thứ tự ưu tiên, luồng nghiệp vụ và Dependency giữa các màn hình.

---

## SECTION 1: END TO END STUDENT JOURNEY

Hành trình của Sinh viên từ "Chưa có tài khoản" đến "Được ở KTX", và các màn hình Frontend bắt buộc đi kèm:

1. **Login:** Sinh viên bắt đầu phiên làm việc (hoặc sử dụng tài khoản khách). 
   👉 *Màn hình: `StudentLoginScreen`*
2. **Registration:** Xem thông tin đợt đăng ký nội trú đang mở.
   👉 *Màn hình: `RegistrationLandingScreen`*
3. **Application:** Nộp đơn đăng ký và tải lên tài liệu minh chứng (CCCD, Giấy ưu tiên).
   👉 *Màn hình: `ApplicationFormScreen`*
4. **Application Approval:** (Chờ Admin xử lý). Sinh viên tra cứu trạng thái.
   👉 *Màn hình: `ApplicationStatusScreen`*
5. **Bed Assignment:** (Chờ Admin xử lý). Hệ thống/Admin xếp phòng.
   👉 *Màn hình: `ApplicationStatusScreen` (Cập nhật có số phòng)*
6. **Payment:** Sinh viên nhận hóa đơn và tiến hành thanh toán lệ phí phòng.
   👉 *Màn hình: `PaymentCheckoutScreen`*
7. **Student Creation & Account Activation:** Sinh viên chính thức trở thành "Cư dân", tài khoản được cấp quyền truy cập ứng dụng nội bộ.
   👉 *Màn hình: `AccountActivationScreen` (Thiết lập mật khẩu)*
8. **Check In:** Làm thủ tục nhận phòng vật lý.
   👉 *Màn hình: `CheckInTicketScreen` (Mã QR/Barcode để bảo vệ quét)*
9. **Face Registration:** Sinh viên tự chụp ảnh khuôn mặt gửi lên hệ thống.
   👉 *Màn hình: `FaceRegistrationScreen`*
10. **Dormitory Resident:** Sinh viên sinh hoạt và quẹt thẻ/khuôn mặt qua cổng.
   👉 *Màn hình: `StudentHomeScreen` (Xem thông báo, lịch sử ra vào)*

---

## SECTION 2: ADMIN JOURNEY

Hành trình quản lý luồng nghiệp vụ của Admin/Staff và phân loại màn hình:

1. **Registration Period:** Khởi tạo đợt đăng ký và Import danh sách sinh viên đủ điều kiện.
   👉 *Bắt buộc: `RegistrationPeriodManager`*
2. **Application Review:** Đọc hồ sơ sinh viên, đối chiếu tài liệu và phê duyệt.
   👉 *Bắt buộc: `ApplicationReviewQueue`*
3. **Waiting List:** Xử lý các hồ sơ dự bị nếu hết chỗ.
   👉 *Nâng cao: `WaitingListManager`*
4. **Room Assignment:** Xếp giường cho sinh viên đã được duyệt.
   👉 *Bắt buộc: `RoomAssignmentWorkspace`*
5. **Payment Approval:** Xác nhận sinh viên đã nộp tiền mặt.
   👉 *Bắt buộc (vì Cash đang là chính): `CashPaymentApprovalQueue`*
6. **Face Approval:** Kiểm duyệt ảnh khuôn mặt sinh viên tải lên (Governance).
   👉 *Bắt buộc: `FaceApprovalQueue`*
7. **Check In / Check Out:** Xác nhận sinh viên đến nhận phòng hoặc rời đi.
   👉 *Nâng cao: `CheckInOutDashboard`*

---

## SECTION 3: SCREEN DEPENDENCY MATRIX

Ma trận này chỉ ra nút thắt cổ chai (Bottlenecks) trong luồng UI. Frontend không thể bỏ qua các màn hình nằm ở trên.

| Màn hình (Screen) | Khóa (Depends On / Blocks) | Mức độ chặn (Blocking Level) |
| :--- | :--- | :--- |
| `RegistrationLandingScreen` | Không phụ thuộc gì. | Khởi đầu |
| `ApplicationFormScreen` | Phụ thuộc: Đợt đăng ký mở. <br/> **BLOCKS**: Application Review | **CRITICAL (Gãy toàn bộ hệ thống)** |
| `ApplicationReviewQueue` | Phụ thuộc: Application Form. <br/> **BLOCKS**: Room Assignment & Payment | **CRITICAL (Gãy toàn bộ hệ thống)** |
| `CashPaymentApprovalQueue`| Phụ thuộc: Application Review. <br/> **BLOCKS**: Account Activation & Face | **HIGH** |
| `FaceRegistrationScreen` | Phụ thuộc: Payment. <br/> **BLOCKS**: Face Approval | **HIGH (Gãy luồng AI/IoT)** |
| `FaceApprovalQueue` | Phụ thuộc: Face Registration. <br/> **BLOCKS**: IoT Smart Access Gate | **HIGH (Gãy luồng AI/IoT)** |

**Kết luận Nút cổ chai:** `ApplicationReviewQueue` (Web Admin) là màn hình quan trọng nhất hiện tại. Thiếu nó, toàn bộ các luồng phía sau đều đứng im vì trạng thái đơn mãi ở mức `PENDING`.

---

## SECTION 4: CRITICAL DEMO FLOW

Giả sử Demo vào ngày mai, Frontend chỉ được phép làm đúng **6 màn hình (Critical Path)** để diễn tả sự trơn tru của hệ thống:

**Phải hoàn thành trước:**
1. **Public Web:** `ApplicationFormScreen` (Sinh viên submit đơn).
2. **Admin Web:** `ApplicationReviewQueue` (Admin nhấn Approve đơn).
3. **Public/Student Web:** `FaceRegistrationScreen` (Sinh viên Upload ảnh).
4. **Admin Web:** `FaceApprovalQueue` (Admin Approve ảnh khuôn mặt).
5. **Admin Web:** `SmartAccessMonitor` (Admin kích hoạt mở cổng từ xa hoặc xem log).

**Có thể Mock (Giả lập) / Bỏ qua:**
- `CashPaymentApprovalQueue` (Có thể dùng Postman/DB script để update trạng thái Đã thanh toán).
- `RoomAssignmentWorkspace` (Có thể Fix cứng một Room ID trong DB cho buổi Demo).

---

## SECTION 5: FACE MODULE UI IMPACT

Face Module trong SDMS đã được định vị là **Governance (Quản trị)**. Logic tách AI khỏi Spring Boot giảm gánh nặng cho UI rất nhiều.

- **Student App (Cần làm):** `FaceCaptureScreen`. Yêu cầu UI mở Camera trước. Sinh viên tự chụp ảnh (Capture) $\rightarrow$ Đẩy URL (Submit Result) lên Backend. 
  - *Không thiết kế logic nhận diện khuôn mặt hay vẽ box trên frontend.*
- **Admin Web (Cần làm):** `FaceApprovalQueue`. Yêu cầu UI dạng Card/Lưới hiển thị Ảnh do sinh viên tải lên. Admin chỉ cần bấm "Chấp nhận" hoặc "Yêu cầu chụp lại" (Reject).

---

## SECTION 6: PAYMENT UI IMPACT

Module Payment đã PASS và Cash Payment đã hoạt động. Tính năng SePay chưa bắt buộc.

- **Cần làm ngay (P0):** 
  - Admin Web: `CashPaymentApprovalQueue` (Danh sách chờ xác nhận đóng tiền mặt).
  - Student Web: `PaymentInstructionScreen` (Hiển thị số tiền cần đóng và thông báo "Đang chờ kế toán xác nhận" hoặc "Tới phòng công tác sinh viên để đóng tiền").
- **Có thể Postpone (P2):**
  - Trải nghiệm Webhook SePay, quét QR tự động nhảy trạng thái trên màn hình (`SePayGatewayScreen`).

---

## SECTION 7: IOT READINESS IMPACT

Định hướng IoT: RFID (Cổng chính), Face (Cổng tòa nhà), Remote Unlock (Admin).

- **Cần chuẩn bị ngay (P1):**
  - Admin Web: `RemoteUnlockButton` (Nút bấm khẩn cấp để mở cổng từ xa trên Dashboard Admin).
  - Admin Web: `SmartAccessLogs` (Danh sách ai vừa ra/vào).
- **Chưa cần chuẩn bị (P2):**
  - Giao diện đăng ký thẻ RFID cho sinh viên.
  - Giao diện phân tích biểu đồ giờ giấc sinh hoạt.

---

## SECTION 8: PRIORITY MATRIX

| Phân loại | Màn hình (Screens) |
| :--- | :--- |
| **P0 (Must Have For Demo)** | `ApplicationFormScreen`, `ApplicationReviewQueue`, `FaceRegistrationScreen`, `FaceApprovalQueue` |
| **P1 (Must Have For MVP)** | `CashPaymentApprovalQueue`, `RoomAssignmentWorkspace`, `PaymentInstructionScreen`, `SmartAccessLogs` |
| **P2 (Can Wait)** | `WaitingListManager`, `CheckInOutDashboard`, `SePayGatewayScreen`, `StudentRFIDManager` |

---

## SECTION 9: RECOMMENDED FRONTEND ROADMAP

Dựa trên Dependency và Priority, Roadmap xây dựng Frontend trong 3 tuần tới:

- **WEEK 1: Bẻ gãy Nút cổ chai (Unblock Core Flow)**
  - Tập trung 100% nhân lực làm `ApplicationReviewQueue` (Admin).
  - Hoàn thiện `ApplicationFormScreen` (Public).
  - Làm màn hình `FaceRegistrationScreen` và `FaceApprovalQueue`.
  - *Kết thúc Tuần 1: Có thể Demo hoàn chỉnh từ lúc nộp đơn đến lúc đăng ký khuôn mặt.*
  
- **WEEK 2: Vận hành nội trú (Operations)**
  - Thiết kế luồng Xếp phòng: `RoomAssignmentWorkspace`.
  - Thiết kế luồng Tiền bạc: `CashPaymentApprovalQueue` và `PaymentInstructionScreen`.
  - Thiết kế `SmartAccessLogs` để chuẩn bị tích hợp phần cứng IoT.

- **WEEK 3: Tối ưu và Nâng cao (Polishing)**
  - Cấu hình SePay Webhook UI.
  - Xây dựng hệ thống `CheckInOutDashboard` và Cấu hình giờ giới nghiêm (Curfew).

---

## SECTION 10: FINAL DECISION

- **Frontend Critical Path:** Application Submit $\rightarrow$ Admin Review $\rightarrow$ Face Upload $\rightarrow$ Admin Face Governance.
- **Frontend Bottlenecks:** Việc thiếu giao diện `ApplicationReviewQueue` của Admin đang khiến hệ thống bị đóng băng 100%, không sinh viên nào tới được bước tiếp theo.
- **Recommended Build Order:** Ưu tiên xây dựng Frontend dựa theo mô hình "Mở khóa", màn hình nào đang Block bước tiếp theo phải làm ngay (Admin Review $\rightarrow$ Payment $\rightarrow$ Face).
- **Demo Readiness Score:** **20% (FAIL)** - Với trạng thái Frontend hiện tại (chỉ có form đăng ký trống, chưa có review, chưa có AI Face), không thể Demo End-to-End. Cần code gấp 4 màn hình P0.
