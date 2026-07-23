2.2. CÔNG NGHỆ SỬ DỤNG

Để đáp ứng yêu cầu quản lý, kiểm soát ra vào và khả năng mở rộng trong quá trình vận hành, Hệ thống Quản lý Ký túc xá Thông minh (Smart Dormitory Management System - SDMS) được xây dựng trên cơ sở kết hợp giữa các công nghệ phát triển phần mềm, trí tuệ nhân tạo, Internet vạn vật (Internet of Things - IoT) và các nền tảng hỗ trợ triển khai. Việc lựa chọn các công nghệ này nhằm bảo đảm hệ thống hoạt động ổn định, đáp ứng nhu cầu quản lý thực tế, đồng thời tạo điều kiện thuận lợi cho việc bảo trì và phát triển trong tương lai.

2.2.1. Công nghệ phần mềm
Phân hệ phần mềm đóng vai trò trung tâm trong việc xử lý nghiệp vụ, quản lý dữ liệu và cung cấp giao diện cho người dùng. Hệ thống được xây dựng dựa trên các công nghệ hiện đại nhằm bảo đảm hiệu năng, tính ổn định và khả năng mở rộng. Các công nghệ phần mềm được sử dụng trong hệ thống được trình bày trong Bảng 2.1.

| Thành phần | Công nghệ sử dụng | Mục đích |
| :--- | :--- | :--- |
| Backend | Java 17, Spring Boot | Xây dựng các dịch vụ xử lý nghiệp vụ, cung cấp API, quản lý phân quyền và bảo mật hệ thống. |
| Cơ sở dữ liệu | PostgreSQL | Lưu trữ dữ liệu, quản lý dữ liệu quan hệ và bảo đảm tính toàn vẹn của dữ liệu. |
| Frontend | React, Vite, Material UI (MUI) | Phát triển giao diện website dành cho ban quản lý và sinh viên với khả năng tương tác cao. |
| Ứng dụng di động | Kotlin, Jetpack Compose | Xây dựng ứng dụng Android phục vụ sinh viên và ban quản lý, hỗ trợ thao tác thuận tiện trên thiết bị di động. |
| Dịch vụ trí tuệ nhân tạo | Python, FastAPI | Xây dựng dịch vụ nhận diện khuôn mặt phục vụ quá trình xác thực và kiểm soát ra vào. |

<div align="center"><i>Bảng 2.1: Các công nghệ phần mềm được sử dụng.</i></div>

2.2.2. Nền tảng phần cứng
Bên cạnh hệ thống phần mềm, đề tài triển khai các thiết bị IoT nhằm hỗ trợ tự động hóa quá trình kiểm soát ra vào ký túc xá. Các thiết bị này có nhiệm vụ thu nhận dữ liệu từ người dùng, giao tiếp với máy chủ và điều khiển cơ cấu đóng mở cửa. Thành phần phần cứng và giao thức truyền thông được sử dụng trong hệ thống được trình bày trong Bảng 2.2.

| Thành phần | Thiết bị / Giao thức | Mục đích |
| :--- | :--- | :--- |
| Cổng chính (Smart Access Gate) | ESP32-CAM, RFID RC522 | Thu nhận hình ảnh khuôn mặt và đọc thẻ từ để gửi dữ liệu đến máy chủ xác thực. |
| Cửa phòng (Room Door) | ESP32, bàn phím ma trận, màn hình LCD | Hỗ trợ người dùng nhập mã xác thực và hiển thị trạng thái hoạt động của hệ thống. |
| Điều khiển và truyền dữ liệu | Servo/Relay, MQTT, HTTP | Điều khiển cơ cấu đóng mở cửa và truyền nhận dữ liệu giữa thiết bị IoT với máy chủ. |

<div align="center"><i>Bảng 2.2: Các nền tảng phần cứng và thiết bị IoT.</i></div>

<div align="center">
<i>(Chèn Hình 2.3: Mạch thực nghiệm ESP32-CAM kết nối với đầu đọc RFID RC522 và các thiết bị ngoại vi)</i>
</div>

2.2.3. Công nghệ triển khai
Để bảo đảm hệ thống có thể triển khai thuận tiện, dễ dàng quản lý và mở rộng trong tương lai, đề tài sử dụng các công nghệ hỗ trợ triển khai theo mô hình dịch vụ độc lập. Các công nghệ triển khai được sử dụng trong hệ thống được trình bày trong Bảng 2.3.

| Thành phần | Công nghệ sử dụng | Mục đích |
| :--- | :--- | :--- |
| Ảo hóa ứng dụng | Docker | Đóng gói các thành phần của hệ thống, bảo đảm tính đồng nhất giữa các môi trường phát triển và triển khai. |
| Quản lý dịch vụ | Docker Compose | Quản lý cấu hình và khởi động đồng thời các dịch vụ của hệ thống. |
| Máy chủ trung gian | Eclipse Mosquitto (MQTT Broker) | Quản lý việc truyền nhận dữ liệu giữa các thiết bị IoT và máy chủ Backend. |

<div align="center"><i>Bảng 2.3: Các công nghệ triển khai hệ thống.</i></div>
