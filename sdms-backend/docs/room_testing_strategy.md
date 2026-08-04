# CHIẾN LƯỢC KIỂM THỬ MODULE QUẢN LÝ PHÒNG VÀ LƯU TRÚ (ROOM & HOUSING ASSIGNMENT)

## 1. Mục tiêu kiểm thử (Testing Objectives)
Module `Room` là trái tim cốt lõi nhất của KTX. Nó chứa logic vô cùng phức tạp về vòng đời giường bệnh/giường KTX (Beds), Trạng thái cư trú (Occupancy), và Chuyển trạng thái (Check-in/Check-out/Eviction).
Do đó, trọng tâm kiểm thử phải đặt vào:
1. **Tính Toàn Vẹn Của Trạng Thái (State Integrity):** Một giường không bao giờ được phép có 2 người đang chiếm dụng (OCCUPIED). Một sinh viên không bao giờ được phép có 2 hợp đồng lưu trú (OCCUPIED) cùng lúc.
2. **Logic Check-in & Kích hoạt Tài Khoản:** Đảm bảo khi sinh viên Check-in thành công qua quét CCCD, các luồng kích hoạt tài khoản hệ thống (UserAccount) và phát thẻ từ/PIN IoT được thực thi đúng.

## 2. Đối tượng kiểm thử ưu tiên cao (High-Priority Services)
Sẽ không dàn trải viết test cho mọi file, chúng ta tập trung Unit Test vào 2 nghiệp vụ xương sống:
- `CheckInService`: Xử lý đầu vào (Quét CCCD, nhận diện, check-in, đổi trạng thái OCCUPIED).
- `HousingAssignmentService` (Hoặc Schedulers): Nghiệp vụ tự động quét quá hạn (Reservation Expiry) - nếu sinh viên thanh toán xong nhưng sau 15 ngày không tới nhận phòng thì sẽ bị thu hồi giường.

## 3. Các kịch bản kiểm thử cốt lõi (Core Test Cases)

### 3.1. CheckInService (Nghiệp vụ Nhận Phòng)
- **Kịch bản 1 (Tìm kiếm hợp lệ):** Quét CCCD hợp lệ -> Trả về đúng thông tin phòng, giường, và biên lai. Trạng thái `PENDING_CHECKIN`.
- **Kịch bản 2 (Tìm kiếm lỗi - Trạng thái sai):** Quét CCCD của sinh viên chưa thanh toán (Trạng thái `PENDING_PAYMENT` hoặc đã `OCCUPIED`) -> Bắn ra `AppException(ErrorCode.STUDENT_NOT_ELIGIBLE)`.
- **Kịch bản 3 (Check-in thành công):** Gọi hàm `processCheckIn` -> Cập nhật `AssignmentStatus` thành `OCCUPIED`. Kích hoạt `StudentStatus` thành `ACTIVE`. Phát ra Event `CheckInCompletedEvent`.

### 3.2. Schedulers (Nghiệp vụ Job Tự Động)
- **Kịch bản 1 (ReservationExpiryJob):** Lấy danh sách các Assignment đang `PENDING_CHECKIN` đã quá ngày hẹn tới nhận phòng -> Đổi trạng thái giường về `AVAILABLE`, đổi Assignment thành `EXPIRED` (Soft Eviction). Đảm bảo nhả giường cho người khác.

## 4. Phương pháp thực hiện (Mocking Strategy)
Sử dụng chuẩn `@ExtendWith(MockitoExtension.class)`:
- Không chọc trực tiếp vào Database để tránh làm hỏng dữ liệu.
- Mock `StudentHousingAssignmentRepository` để giả lập kết quả tìm kiếm bằng CCCD.
- Xác minh (Verify) xem Event `CheckInCompletedEvent` có thực sự được publish không (Vì đây là cầu nối để Module Tài Khoản tự tạo Account và Module IoT cấp mã PIN mở cửa).

*Tài liệu này đóng vai trò kim chỉ nam, giúp bám sát và khóa cứng nghiệp vụ. Tránh việc refactor lung tung làm gãy hệ thống phân bổ phòng.*
