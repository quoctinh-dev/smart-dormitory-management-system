# Smart Dormitory Management System (SDMS) 🏢💡

Hệ thống Quản lý Ký túc xá Thông minh (SDMS) là một giải pháp toàn diện kết hợp giữa **Phần mềm (Software)**, **Trí tuệ nhân tạo (AI)** và **Internet vạn vật (IoT)**. Dự án được thiết kế theo kiến trúc Micro-services/Monorepo hướng sự kiện (Event-Driven Architecture) nhằm tự động hóa tối đa quy trình quản lý sinh viên, thanh toán, và an ninh ra vào.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

Dự án là một Monorepo bao gồm 5 phân hệ (modules) chính hoạt động phối hợp chặt chẽ với nhau:

### 1. 🟢 `sdms-backend` (Core System)
- **Công nghệ:** Java Spring Boot, Hibernate, PostgreSQL, MQTT, Spring Events.
- **Nhiệm vụ:** Là "Bộ não" của toàn hệ thống. Quản lý toàn bộ nghiệp vụ lõi: Đăng ký phòng, xếp phòng tự động, quản lý hóa đơn (Billing Chunk), thanh toán tự động qua SePay webhook. Giao tiếp MQTT với thiết bị IoT và gọi API AI để xác thực khuôn mặt.
- **Điểm nổi bật:** Áp dụng kiến trúc Event-Driven (Spring Events) giúp cô lập dữ liệu (Data Isolation) và các Auto-Healing Scheduler đảm bảo tính nhất quán dữ liệu (Data Consistency).

### 2. 🔵 `sdms-frontend` (Web Dashboard)
- **Công nghệ:** ReactJS, Vite, TypeScript, Material UI (MUI).
- **Nhiệm vụ:** Giao diện quản trị dành cho Ban quản lý (Admin) và Sinh viên (trên Web).
- **Điểm nổi bật:** Cung cấp trải nghiệm UI/UX hiện đại (Real-time notifications, thống kê trực quan, sơ đồ phòng ban 2D, dark/light mode).

### 3. 🟣 `sdms-ai-service` (AI Face Verification)
- **Công nghệ:** Python, FastAPI, DeepFace / OpenCV.
- **Nhiệm vụ:** Sidecar service chuyên xử lý trích xuất Vector khuôn mặt và tính toán độ tương đồng (Cosine Similarity).
- **Điểm nổi bật:** Đóng vai trò là chốt chặn an ninh thứ 2 (Dual Authentication) chống gian lận dùng thẻ RFID của người khác. Trả về kết quả trong mili-giây.

### 4. 🟡 `sdms-iot-gateway` (Hardware / Smart Access)
- **Công nghệ:** C++ (PlatformIO / Arduino), ESP32, RFID-RC522, Keypad.
- **Nhiệm vụ:** Mạch phần cứng lắp tại Cổng chính và Cửa các phòng. Đọc thẻ RFID, nhận mã PIN và gửi tín hiệu qua MQTT lên Backend. 
- **Điểm nổi bật:** Điều khiển động cơ mở cửa (Servo), phát cảnh báo hú còi (Buzzer) khi có đột nhập trái phép hoặc cửa mở quá lâu. Hỗ trợ chế độ Global Lockdown (Khóa khẩn cấp toàn khu).

### 5. 📱 `smart-dormitory-app` (Student Mobile App)
- **Công nghệ:** Flutter / React Native (Dự kiến / Mobile Client).
- **Nhiệm vụ:** Ứng dụng di động đồng hành dành riêng cho sinh viên.
- **Điểm nổi bật:** Nhận Push Notification tức thời về thông báo sửa chữa, nhắc nợ hóa đơn. Tích hợp quét mã QR thanh toán nhanh chóng và mã QR thay thế thẻ RFID.

---

## 🚀 Các Tính Năng Nổi Bật (Key Features)

1. **Xếp Phòng Tự Động (Auto Housing Assignment):** Thuật toán tự tìm giường trống, ghép đúng giới tính và tự tạo hóa đơn giữ chỗ.
2. **Thanh Toán Không Chạm (Zero-touch Payment):** Tích hợp SePay tự động gạch nợ hóa đơn (Tiền phòng, điện, nước) khi sinh viên chuyển khoản qua Momo/Banking mà không cần kế toán can thiệp.
3. **An Ninh Xác Thực Kép (Dual-Auth Smart Access):** Kết hợp thẻ vật lý (RFID) và nhận diện sinh trắc học (AI Face). Chặn đứng 100% gian lận.
4. **Hệ Thống Tự Phục Hồi (Auto-Healing Schedulers):** Các Cron-job chạy ngầm quét dọn rác dữ liệu, tự động hủy đơn quá hạn và giải phóng giường.

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy (Getting Started)

Mỗi thư mục module có một file `README.md` riêng biệt (hoặc `AGENTS.md`) hướng dẫn chi tiết cách build và run. Khuyến nghị khởi chạy theo thứ tự sau:

1. **Database:** Khởi chạy PostgreSQL.
2. **Broker:** Khởi chạy MQTT Broker (Mosquitto/EMQX).
3. `sdms-backend`: Cấu hình `.env` và chạy `mvn spring-boot:run`.
4. `sdms-ai-service`: Cài đặt `requirements.txt` và chạy Uvicorn.
5. `sdms-frontend`: Chạy `npm install` và `npm run dev`.
6. `sdms-iot-gateway`: Nạp Firmware xuống ESP32.

---
*Dự án Khóa luận Tốt nghiệp - Đạt tiêu chuẩn Kiến trúc Phần mềm Hiện đại.*
