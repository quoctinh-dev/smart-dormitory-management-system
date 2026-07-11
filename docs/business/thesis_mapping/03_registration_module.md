# Phân tích Thiết kế Module Đăng ký Nội trú (Registration & Application Module)

## 1. Đặt vấn đề
Quy trình đăng ký KTX truyền thống thường yêu cầu sinh viên điền tay hàng chục trường thông tin (Họ tên, ngày sinh, CCCD, quê quán, v.v.), dẫn đến sai sót dữ liệu và tốn thời gian đối soát cho Ban quản lý. Đồng thời, một thực tế tại các trường Đại học là ngay cả Tân sinh viên khi làm thủ tục nhập học đã được cấp sẵn **Mã số sinh viên (Student Code)**, do đó thiết kế hệ thống phải có khả năng map (liên kết) đơn đăng ký KTX với hệ thống Đào tạo của trường thay vì tự sinh mã ngẫu nhiên.

## 2. Phân tích Giải pháp (DDD & Automation)
Dựa trên nguyên lý Tự động hóa và Domain-Driven Design (DDD), Module được thiết kế với hai Aggregate Root chính: `RegistrationPeriod` (Đợt đăng ký) và `DormitoryApplication` (Đơn đăng ký).

### 2.1 Tự động hóa trích xuất dữ liệu bằng AI (eKYC / OCR)
Thay vì điền form thủ công, hệ thống SDMS áp dụng công nghệ nhận dạng ký tự quang học (OCR) để **đọc trực tiếp thông tin từ ảnh chụp Căn cước công dân (CCCD)** do sinh viên tải lên:
- **Pipeline:** Upload CCCD (Front/Back) -> FastAPI AI Service (SDMS-AI) -> Extract: `Họ tên, Ngày sinh, CCCD, Giới tính, Quê quán`.
- **Ưu điểm:** Giảm thiểu 80% thời gian nhập liệu, loại bỏ rủi ro sai chính tả hoặc giả mạo thông tin. Đảm bảo dữ liệu CCCD nhập vào hệ thống chính xác tuyệt đối ngay từ nguồn.

### 2.2 Tích hợp Mã số sinh viên (Student Code Integration)
- Khác với nhiều hệ thống KTX độc lập tự cấp ID cho cư dân, SDMS mở thêm trường dữ liệu `studentCode` ngay trên `DormitoryApplication`.
- **Lý do:** Sinh viên (bao gồm Tân sinh viên) đều đã có Mã số sinh viên từ Phòng Đào Tạo trước khi làm Đơn cam kết KTX. Việc gắn liền `studentCode` từ khâu đăng ký giúp hệ thống KTX đồng bộ xuyên suốt với hệ sinh thái chung của toàn trường (như Cổng thanh toán học phí, Thư viện).

### 2.3 Workflow: "Sinh viên hợp lệ" (Valid Student Creation)
Khi Đơn đăng ký (`DormitoryApplication`) được Admin **Duyệt (APPROVED)** và thanh toán thành công, hệ thống kích hoạt một Domain Event (`ApplicationApprovedEvent`).
- **Hành động tự động:** Hệ thống tự động khởi tạo Entity `Student` (chứa toàn bộ profile) và `UserAccount` (Tài khoản truy cập App/Web) với trạng thái `PENDING_ACTIVATION`.
- Sinh viên không cần phải được Admin nhập tay vào danh sách cư dân. Toàn bộ là Pipeline tự động, đảm bảo nguyên tắc *Single Source of Truth* (Nguồn sự thật duy nhất).

## 3. Kiến trúc Database và Ràng buộc Dữ liệu (Data Integrity)
- **Unique Constraint:** Áp dụng `UniqueConstraint(period_id, cccd)` trên bảng `dormitory_applications` để ngăn chặn Spam đăng ký (Một CCCD chỉ nộp 1 đơn/đợt).
- **Soft Reference:** `DormitoryApplication` chỉ tham chiếu `reviewedByUserId` thay vì Join trực tiếp với `UserAccount` của Admin, tránh dính líu chéo (Coupling) giữa hai Module khác nhau.
- **Audit Trails:** Lưu trữ `clientIpAddress`, `commitmentAcceptedAt` và `commitmentVersion` để đảm bảo tính pháp lý của Đơn cam kết điện tử. Mọi thay đổi trạng thái (SUBMITTED -> REVIEWING -> APPROVED) đều được log lại bằng `DormitoryApplicationStatusHistory`.

## 4. Đánh giá Ưu điểm
- **Trải nghiệm người dùng cực cao:** Sinh viên chỉ cần upload CCCD, nhập Mã số sinh viên và thông tin liên hệ là xong.
- **Tính tự động hóa (Automation):** Backend tự động chuyển đổi từ Đơn đăng ký sang Cư dân và Tài khoản hợp lệ mà không cần Admin can thiệp tạo tài khoản.
- **Độ tin cậy dữ liệu:** Nhờ OCR và ràng buộc Unique Database, rác dữ liệu (Garbage data) bị triệt tiêu ngay từ vòng nộp đơn.
