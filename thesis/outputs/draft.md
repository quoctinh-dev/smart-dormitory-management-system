1.3. NỘI DUNG, PHẠM VI THỰC HIỆN

Đề tài tập trung xây dựng Hệ thống Quản lý Ký túc xá Thông minh (Smart Dormitory Management System - SDMS) nhằm hỗ trợ ban quản lý và sinh viên Trường Đại học Công nghệ Sài Gòn (STU) trong công tác quản lý, vận hành và sử dụng các dịch vụ của ký túc xá. Phạm vi nghiên cứu được xác định dựa trên các nghiệp vụ cốt lõi của ký túc xá, kết hợp giữa hệ thống phần mềm, trí tuệ nhân tạo và các thiết bị IoT nhằm nâng cao hiệu quả quản lý, giảm thao tác thủ công và từng bước hiện đại hóa công tác quản lý ký túc xá.

1.3.1. Nội dung thực hiện

Trong phạm vi nghiên cứu, đề tài tập trung xây dựng các chức năng phục vụ công tác quản lý và vận hành ký túc xá. Các nội dung chính bao gồm:

▪ Xây dựng hệ thống quản lý cơ sở vật chất, bao gồm quản lý tòa nhà, tầng, phòng và giường.

▪ Xây dựng quy trình quản lý nội trú khép kín từ đăng ký lưu trú, xét duyệt hồ sơ, sắp xếp giường, nhận phòng, chuyển phòng, gia hạn lưu trú đến trả phòng.

▪ Xây dựng chức năng quản lý hóa đơn, thanh toán tiền điện, tiền nước và theo dõi tình trạng thanh toán.

▪ Xây dựng hệ thống thông báo và thống kê nhằm hỗ trợ ban quản lý theo dõi tình hình hoạt động của ký túc xá.

▪ Xây dựng cơ chế phân quyền giữa ban quản lý và sinh viên phù hợp với chức năng sử dụng của từng đối tượng.

▪ Tích hợp chức năng nhận diện khuôn mặt và thẻ từ RFID để phục vụ kiểm soát ra vào ký túc xá.

▪ Kết nối và quản lý các thiết bị tại cổng kiểm soát nhằm hỗ trợ quá trình vận hành của hệ thống.

1.3.2. Phạm vi hệ thống

Phạm vi triển khai của hệ thống được chia thành ba thành phần chính.

▪ Phần mềm: Bao gồm website quản trị dành cho ban quản lý, website dành cho sinh viên, ứng dụng di động, máy chủ xử lý nghiệp vụ cùng các chức năng quản lý cơ sở vật chất, quy trình nội trú, hóa đơn, thanh toán, thông báo, thống kê và phân quyền người dùng.

▪ Trí tuệ nhân tạo: Xây dựng dịch vụ nhận diện khuôn mặt nhằm hỗ trợ xác thực sinh viên trong quá trình kiểm soát ra vào ký túc xá.

▪ Thiết bị IoT: Triển khai cổng kiểm soát sử dụng vi điều khiển ESP32 kết hợp đầu đọc thẻ RFID RC522 để điều khiển việc mở cửa và trao đổi dữ liệu với hệ thống thông qua mạng không dây.

1.3.3. Giới hạn đề tài

Để bảo đảm phạm vi nghiên cứu phù hợp với mục tiêu của luận văn, đề tài không triển khai các nội dung sau:

▪ Không tích hợp trực tiếp các ví điện tử như MoMo hoặc ZaloPay; hệ thống sử dụng SePay để ghi nhận giao dịch chuyển khoản thông qua mã QR.

▪ Không xây dựng chức năng quản lý nhân sự và tính lương cho ban quản lý.

▪ Không xây dựng chức năng quản lý bãi giữ xe của ký túc xá.

▪ Không xây dựng chức năng quản lý kỷ luật, khen thưởng và bảo trì cơ sở vật chất.

1.4. KẾT QUẢ CẦN ĐẠT

Sau khi hoàn thành, Hệ thống Quản lý Ký túc xá Thông minh (Smart Dormitory Management System - SDMS) được kỳ vọng đáp ứng đầy đủ các yêu cầu về chức năng, khả năng vận hành và tính ổn định khi triển khai tại ký túc xá Trường Đại học Công nghệ Sài Gòn. Các tiêu chí đánh giá kết quả của đề tài được trình bày trong Bảng 1.1.

Bảng 1.1. Tiêu chí đánh giá kết quả của hệ thống

| STT | Tiêu chí đánh giá | Kết quả kỳ vọng |
|---|---|---|
| 1 | Quản lý cơ sở vật chất | Số hóa thông tin tòa nhà, tầng, phòng, giường và hỗ trợ quản lý tập trung trên hệ thống. |
| 2 | Quy trình nội trú | Thực hiện đầy đủ quy trình đăng ký lưu trú, xét duyệt, sắp xếp giường, nhận phòng, chuyển phòng, gia hạn và trả phòng trên hệ thống. |
| 3 | Kiểm soát ra vào | Hỗ trợ điểm danh và mở cửa bằng nhận diện khuôn mặt hoặc thẻ từ RFID đối với sinh viên được cấp quyền. |
| 4 | Thanh toán | Tự động cập nhật trạng thái thanh toán hóa đơn điện, nước thông qua SePay mà không cần đối soát thủ công. |
| 5 | Tốc độ vận hành | Hệ thống bảo đảm thời gian nhận diện và mở cửa đủ nhanh để hạn chế ùn tắc tại cổng ký túc xá. |
| 6 | Khả năng phục vụ | Hệ thống hoạt động ổn định khi có nhiều sinh viên sử dụng đồng thời trong các khung giờ cao điểm. |
| 7 | Tính chính xác của dữ liệu | Mỗi giao dịch thanh toán chỉ được ghi nhận một lần, hạn chế việc cập nhật trùng lặp dữ liệu. |
| 8 | Thiết bị IoT | Hoàn thiện mô hình thiết bị IoT hoạt động ổn định, kết nối với mạng WiFi của ký túc xá và hỗ trợ kiểm soát ra vào. |