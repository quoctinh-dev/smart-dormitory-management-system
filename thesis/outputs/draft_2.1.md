2.1. CÁC HỆ THỐNG TƯƠNG TỰ

Trong quá trình phân tích và thiết kế, đề tài đã tiến hành khảo sát các hệ thống quản lý ký túc xá đang được vận hành thực tế tại một số trường đại học lớn thông qua các nguồn thông tin công khai. Mục đích nhằm đánh giá ưu, nhược điểm và rút ra bài học kinh nghiệm.

2.1.1. Hệ thống quản lý Ký túc xá Đại học Kinh tế TP.HCM (UEH)
Hệ thống quản lý ký túc xá của UEH được vận hành thông qua cụm cổng thông tin điện tử:
- **Trang thông tin:** `https://ktx.ueh.edu.vn/`
- **Cổng đăng ký & thanh toán:** `https://kytucxa.ueh.edu.vn/`

- Ưu điểm (Đã kiểm chứng):
  - Số hóa quy trình đăng ký: Có phân hệ "Đăng ký nội trú KTX" riêng biệt, cho phép sinh viên dùng Mã số sinh viên (MSSV) để tra cứu và đăng ký phòng.
  - Công khai tiện ích và cơ sở vật chất: Website cung cấp thông tin minh bạch về cơ sở vật chất (wifi, máy nước nóng lạnh, phòng giặt) và hệ thống an ninh (camera, thẻ từ).
- Nhược điểm (Dựa trên cấu trúc hệ thống):
  - Phụ thuộc hoàn toàn vào nền tảng Web: Hệ thống hiện tại là Web-based, chưa có Ứng dụng di động (Mobile App) chuyên biệt dành cho sinh viên nội trú.
  - Hạn chế về tương tác thời gian thực: Vì không có Mobile App, việc gửi cảnh báo khẩn cấp hoặc thông báo cá nhân hóa (In-App Notification) đến trực tiếp điện thoại sinh viên sẽ bị hạn chế.

*(Chèn 1 Hình ảnh duy nhất: Hình 2.1 - Giao diện cổng đăng ký KTX UEH)*

2.1.2. Hệ thống quản lý Ký túc xá Đại học Công nghiệp TP.HCM (IUH)
Hệ thống quản lý KTX của IUH có sự liên kết chặt chẽ với cổng thông tin đào tạo của nhà trường:
- **Trang hướng dẫn KTX:** `https://ktx.iuh.edu.vn/`
- **Cổng xác thực sinh viên (SSO):** `https://sv.iuh.edu.vn/`

- Ưu điểm (Đã kiểm chứng):
  - Đồng bộ hóa tài khoản (SSO): Sinh viên sử dụng chung tài khoản từ cổng thông tin sinh viên (sv.iuh.edu.vn) để đăng nhập, không cần tạo tài khoản mới.
  - Hệ thống thông báo rõ ràng: Sử dụng các kênh liên lạc phổ biến (như Zalo) để gửi kết quả xét duyệt sau 24h-48h.
- Nhược điểm (Dựa trên cấu trúc hệ thống):
  - Vẫn tồn tại quy trình xử lý bán thủ công: Mặc dù đăng ký online, nhưng các thủ tục như ưu tiên chính sách, nộp giấy tờ minh chứng vẫn cần khâu kiểm duyệt trực tiếp từ con người, thời gian xét duyệt kéo dài từ 1-2 ngày.
  - Thiếu thiết bị đầu cuối thông minh (IoT/AI): Các hệ thống hiện tại quản lý an ninh chủ yếu dựa vào bảo vệ trực và thẻ từ truyền thống, chưa tích hợp nhận diện khuôn mặt (AI) để tự động hóa việc điểm danh và chống gian lận thẻ.

*(Chèn 1 Hình ảnh duy nhất: Hình 2.2 - Giao diện trang chủ KTX IUH)*

2.1.3. Bài học kinh nghiệm cho hệ thống SDMS (STU)
Từ việc khảo sát các hệ thống trên, định hướng phát triển Hệ thống Quản lý Ký túc xá Thông minh (SDMS) tại Đại học Công nghệ Sài Gòn (STU) được tập trung vào việc kế thừa ưu điểm và bổ sung các công nghệ tiên tiến:
1. Đa nền tảng (Web & Mobile App): Xây dựng song song Web Admin và Mobile App Student, cho phép nhận thông báo trực tiếp trên ứng dụng (In-App Notification) tức thời về điện thoại.
2. Thanh toán tự động (Webhook): Tích hợp giải pháp nhận diện dòng tiền tự động qua SePay, khắc phục hoàn toàn sự chậm trễ trong khâu đối soát tài chính thủ công.
3. An ninh thông minh (IoT & AI): Nâng cấp cổng kiểm soát bằng vi điều khiển ESP32 và công nghệ nhận diện khuôn mặt (FaceNet), giải quyết triệt để tình trạng mượn thẻ, quẹt thẻ hộ, và tự động hóa khâu điểm danh giới nghiêm 22h00.
