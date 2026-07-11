# Các Nguyên tắc Thiết kế Cốt lõi của Hệ thống SDMS
**Phiên bản:** 1.0 · **Ngày:** 2026-06-26

Tài liệu này định nghĩa các nguyên tắc kiến trúc nền tảng, đóng vai trò là "hiến pháp" cho việc phát triển và vận hành hệ thống SDMS. Mọi quyết định thiết kế đều phải tuân thủ các nguyên tắc này để đảm bảo hệ thống có tính bền vững, linh hoạt và đáng tin cậy.

---

### Nguyên tắc 1: Tách biệt Module Nghiệp vụ (Decoupling via Events)

#### 1.1. Quy tắc
Các module nghiệp vụ chính (Application, Room, Payment, Student) **TUYỆT ĐỐI KHÔNG** được có sự phụ thuộc trực tiếp vào nhau ở tầng mã nguồn (không `import` Service hoặc Repository của nhau). Mọi sự tương tác và giao tiếp giữa các module này phải được thực hiện một cách **bất đồng bộ** thông qua một hệ thống **Sự kiện Miền (Domain Events)**.

#### 1.2. Luồng đi Chuẩn
1.  Một module hoàn thành một nghiệp vụ quan trọng (ví dụ: `ApplicationService` duyệt xong một đơn).
2.  Nó sẽ **phát (publish)** một sự kiện mang tính thông báo, chứa dữ liệu tối thiểu cần thiết (ví dụ: `ApplicationApprovedEvent` với `applicationId`).
3.  Các module khác có liên quan sẽ **lắng nghe (subscribe)** sự kiện đó và tự mình thực hiện các hành động tương ứng trong phạm vi trách nhiệm của chúng.

#### 1.3. Lý do Thực tế & Luận cứ Bảo vệ
*   **Khả năng Chịu lỗi (Fault Tolerance):** Đây là luận điểm mạnh nhất. Trong thực tế, một hệ thống con có thể bị lỗi. Ví dụ, nếu dịch vụ thanh toán (`Payment`) tạm thời ngừng hoạt động, việc duyệt đơn (`Application`) vẫn có thể tiếp tục diễn ra bình thường. Khi module `Payment` hoạt động trở lại, nó sẽ xử lý các sự kiện đã bị "lỡ", đảm bảo hệ thống không bị sụp đổ dây chuyền.
*   **Dễ dàng Bảo trì và Nâng cấp:** Khi các module được tách biệt, việc sửa đổi logic trong module `Room` sẽ không ảnh hưởng đến module `Application`. Chúng ta có thể nâng cấp hoặc thay thế từng module mà không làm gián đoạn toàn bộ hệ thống.
*   **Mô phỏng Tổ chức Thực tế:** Kiến trúc này mô phỏng chính xác cách một tổ chức hoạt động. Phòng Tuyển sinh không chạy sang phòng Kế toán để tự tạo hóa đơn. Họ chỉ gửi một "thông báo" và phòng Kế toán sẽ tự xử lý.

---

### Nguyên tắc 2: Đảm bảo Tính Bất biến (Idempotency)

#### 2.1. Quy tắc
Mọi API endpoint hoặc trình xử lý sự kiện (event handler) tiếp nhận thông tin từ bên ngoài (Webhook từ cổng thanh toán, tin nhắn MQTT từ IoT) phải được thiết kế để chống trùng lặp. Dù một yêu cầu giống hệt nhau được gửi đến N lần, nghiệp vụ chỉ được thực thi **duy nhất một lần**.

#### 2.2. Lý do Thực tế & Luận cứ Bảo vệ
*   **Mạng không đáng tin cậy:** Trong thực tế, do lỗi mạng, một cổng thanh toán có thể không nhận được phản hồi từ hệ thống của chúng ta và sẽ thử gửi lại webhook. Nếu không có cơ chế Idempotency, sinh viên có thể bị ghi nhận thanh toán hai lần cho cùng một hóa đơn.
*   **Tăng độ tin cậy của Hệ thống:** Nguyên tắc này đảm bảo rằng hệ thống luôn ở trạng thái nhất quán, bất chấp sự không ổn định của các tác nhân bên ngoài.

---

### Nguyên tắc 3: Đối soát và Tự sửa lỗi (Reconciliation)

#### 3.1. Quy tắc
Hệ thống phải có các **Job chạy định kỳ (Scheduled Jobs)** để thực hiện việc đối soát dữ liệu. Các job này có trách nhiệm so sánh trạng thái dữ liệu giữa SDMS và các hệ thống bên ngoài (cổng thanh toán), hoặc thậm chí giữa các module nội bộ với nhau.

#### 3.2. Lý do Thực tế & Luận cứ Bảo vệ
*   **"Lưới Bảo vệ Cuối cùng":** Đây là cơ chế phòng thủ cuối cùng cho các lỗi không lường trước. Trong trường hợp một webhook bị "thất lạc" hoàn toàn và không bao giờ đến được hệ thống, hoặc một sự kiện nội bộ bị lỗi và không được xử lý, hệ thống sẽ rơi vào trạng thái sai lệch (ví dụ: tiền đã nhận nhưng hóa đơn vẫn `UNPAID`).
*   **Tự động Phục hồi:** Job đối soát sẽ định kỳ quét, phát hiện ra sự sai lệch này, và tự động kích hoạt quy trình sửa lỗi (ví dụ: cập nhật lại trạng thái hóa đơn và phát lại sự kiện `PaymentSuccessEvent`). Điều này giảm thiểu sự can thiệp thủ công của Admin và tăng cường sự tin cậy của dữ liệu.
