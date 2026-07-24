# NỘI DUNG MỤC 3.3.1 — MỨC Ý NIỆM (Viết lại ngắn gọn, đúng chuẩn luận văn)
> Copy nội dung bên dưới vào Luận văn Word (thay thế phiên bản cũ)

---

## 3.3.1 Mức ý niệm

Mô hình dữ liệu mức ý niệm của hệ thống SDMS được xây dựng nhằm thể hiện toàn bộ các đối tượng nghiệp vụ và mối liên kết giữa chúng theo cách nhìn của người dùng cuối, hoàn toàn độc lập với nền tảng công nghệ và hệ quản trị cơ sở dữ liệu cụ thể. Mô hình được biểu diễn bằng sơ đồ thực thể – mối liên kết (ERD) theo ký pháp Crow's Foot, trong đó mỗi thực thể chỉ thể hiện tên gọi nghiệp vụ và các mối quan hệ giữa chúng được ký hiệu theo bội số (một-một, một-nhiều, không hoặc một).

*(Chèn Hình 3.X: Sơ đồ thực thể – mối liên kết mức ý niệm của hệ thống SDMS)*

Hệ thống bao gồm **29 thực thể nghiệp vụ**, được tổ chức thành tám nhóm chức năng:

| STT | Nhóm thực thể | Danh sách thực thể |
|-----|---------------|---------------------|
| 1 | Hệ thống & Tài khoản | UserAccount, SystemConfig |
| 2 | Sinh viên | Student |
| 3 | Cơ sở vật chất | Building, Floor, Room, Bed |
| 4 | Đăng ký lưu trú | RegistrationPeriod, RegistrationEligibility, DormitoryApplication, ApplicationPriority, VerificationDocument, DormitoryApplicationStatusHistory, StudentHousingAssignment |
| 5 | Yêu cầu nội bộ & Dịch vụ | StayExtension, CheckoutRequest, ChangeRoomRequest, CurfewRequest, UtilityUsage |
| 6 | Tài chính & Hóa đơn | Bill, Payment |
| 7 | An ninh IoT & Face AI | Gate, CurfewPolicy, TimeWindowPolicy, AccessHistory, FaceProfile, FaceEmbedding, FaceVerificationAttempt |
| 8 | Thông báo | Notification |

Các mối quan hệ nghiệp vụ cốt lõi giữa các nhóm thực thể được thể hiện qua sơ đồ ERD, bao gồm: chuỗi phân cấp cơ sở vật chất (Tòa nhà → Tầng → Phòng → Giường); vòng đời đăng ký lưu trú (Sinh viên nộp Đơn đăng ký trong một Đợt đăng ký, Đơn được duyệt tạo ra Hợp đồng lưu trú gắn với một Giường cụ thể); các yêu cầu nội bộ và hóa đơn đều phát sinh từ Hợp đồng lưu trú; và luồng kiểm soát an ninh (Tòa nhà áp dụng Chính sách giới nghiêm, Thiết bị cổng ghi nhận Lịch sử ra vào, Sinh viên xác thực bằng Hồ sơ khuôn mặt).

---

### 3.3.1.1 Mô tả các ràng buộc nghiệp vụ

Dưới đây là các ràng buộc nghiệp vụ chính được xác định ở mức ý niệm, mô tả các quy tắc bất biến phải được bảo đảm trong suốt vòng đời dữ liệu của hệ thống:

**[RBPV-01]** Mỗi sinh viên chỉ được phép tồn tại một tài khoản đăng nhập duy nhất trong hệ thống, được xác định bởi mã số sinh viên.

**[RBPV-02]** Trong cùng một đợt đăng ký, mỗi sinh viên chỉ được phép nộp tối đa một đơn đăng ký lưu trú.

**[RBPV-03]** Một đơn đăng ký chỉ được chuyển sang trạng thái "Đã phân phòng" khi có ít nhất một giường còn trống trong hệ thống và sinh viên đã hoàn tất đóng phí theo quy định.

**[RBPV-04]** Tại bất kỳ thời điểm nào, mỗi giường chỉ được phép gắn với tối đa một hợp đồng lưu trú đang có hiệu lực.

**[RBPV-05]** Hóa đơn chỉ được tạo khi sinh viên có hợp đồng lưu trú đang hoạt động trong kỳ tính phí tương ứng.

**[RBPV-06]** Sinh viên chỉ được phép đăng ký nhận diện khuôn mặt khi đã có hợp đồng lưu trú hợp lệ. Mỗi sinh viên chỉ được có một hồ sơ khuôn mặt đang hoạt động tại một thời điểm.

**[RBPV-07]** Thiết bị IoT chỉ cho phép sinh viên qua cổng khi tất cả các điều kiện sau đồng thời được thỏa mãn: (a) Xác thực danh tính thành công qua RFID hoặc nhận diện khuôn mặt; (b) Hợp đồng lưu trú còn hiệu lực; (c) Thời điểm ra vào nằm trong khung giờ cho phép theo chính sách hiện hành hoặc sinh viên có đơn xin về trễ đã được duyệt.

**[RBPV-08]** Khi một hợp đồng lưu trú kết thúc do sinh viên trả phòng hoặc hết hạn hợp đồng, toàn bộ hóa đơn còn tồn đọng phải được thanh toán trước khi hệ thống hoàn tất thủ tục trả phòng và vô hiệu hóa quyền truy cập của sinh viên.
