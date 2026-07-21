# Smart Dormitory Management System (SDMS) - Backend

Dự án SDMS Backend được xây dựng trên nền tảng **Java 17** và **Spring Boot 3**. Backend cung cấp các API để quản lý sinh viên, phòng ở ký túc xá, điện nước, duyệt đơn đăng ký, và tích hợp các dịch vụ bên thứ 3 (Gửi Email, Cloudinary lưu trữ PDF/Ảnh, Thanh toán).

## 🛠 Yêu cầu Hệ thống (Prerequisites)

Để chạy dự án này trên máy cá nhân, bạn cần cài đặt:
- **Java 17** (JDK 17)
- **Maven** (Tùy chọn, dự án đã có sẵn `mvnw`)
- **Docker & Docker Compose** (Khuyến nghị, dùng để chạy nhanh Database)
- Hoặc cài đặt trực tiếp **PostgreSQL 15+** và **Redis 7+** nếu không dùng Docker.

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Chạy Tất Cả Bằng Docker (Cách khuyên dùng - Tự động 100%)
Cách nhanh nhất, sạch máy nhất là sử dụng Docker. Nếu chưa có, hãy tải và cài đặt **[Docker Desktop cho Windows tại đây](https://www.docker.com/products/docker-desktop/)** (Cài đặt mất 5 phút, cứ nhấn Next).

Dự án đã được viết sẵn `Dockerfile` và `docker-compose.yml` tối ưu nhất. Docker sẽ lo liệu từ Database, Redis cho tới việc biên dịch Java và chạy Backend. Bạn **không cần cài Java hay Maven** vào máy.

Mở Terminal tại thư mục `sdms-backend` và chạy lệnh:
```bash
docker-compose up -d --build
```
*Lệnh này sẽ:*
- Chạy container PostgreSQL tích hợp sẵn `pgvector` (nhận diện khuôn mặt).
- Chạy container Redis.
- Tự động Build mã nguồn Spring Boot và khởi chạy Backend ở cổng `8080`.

### Bước 2: Thiết lập Biến Môi Trường (Environment Variables)
Dự án sử dụng file `.env` để bảo mật thông tin các dịch vụ bên thứ 3 (API Keys).
1. Copy hoặc đổi tên file `.env.example` thành `.env`.
2. Mở file `.env` và điền đầy đủ các thông số bắt buộc:
   - **JWT Secrets**: Nhập một chuỗi ngẫu nhiên đủ dài và bảo mật.
   - **Brevo**: Đăng ký tài khoản Brevo (Sendinblue) để lấy API Key phục vụ gửi Email hệ thống.
   - **Cloudinary**: Đăng ký Cloudinary để lấy Cloud Name, API Key, API Secret phục vụ upload ảnh thẻ, sinh file PDF.
   - **Sepay**: API Key dùng để webhook xác nhận thanh toán (nếu có test tính năng này).

*(Lưu ý: File `.env` sẽ không bị push lên Github do đã được định nghĩa trong `.gitignore`)*

### Bước 3: Build & Chạy Dự án (Dành cho Developer - Chạy trực tiếp)
Nếu bạn không muốn chạy Backend bằng Docker mà muốn debug trực tiếp trên máy thật:

> ⚠️ **LƯU Ý QUAN TRỌNG:** Nếu cài tay Database không qua Docker, bạn **BẮT BUỘC** phải cài extension **`pgvector`** vào PostgreSQL. Khuyến nghị Developer nên chạy DB qua lệnh `docker-compose up -d postgres redis` rồi hẵng chạy Backend.

**Cách 1: Sử dụng IntelliJ IDEA**
- Mở thư mục `sdms-backend`.
- Đợi IDE tải xong thư viện Maven.
- Chạy file `BackendApplication.java`.

**Cách 2: Dùng Command Line**
Trong thư mục `sdms-backend`, chạy các lệnh sau:
```bash
# Tải thư viện và biên dịch (bỏ qua Test)
.\mvnw clean install -DskipTests

# Chạy ứng dụng Spring Boot
.\mvnw spring-boot:run
```

### Bước 4: Flyway Migration (Tự động hóa Database)
Bạn không cần phải tự tạo bảng hay import file SQL. Khi ứng dụng Spring Boot khởi động thành công lần đầu tiên, **Flyway** sẽ tự động chạy tất cả các script trong `src/main/resources/db/migration/` để tạo các Table cần thiết và đổ dữ liệu mẫu (Seed Data) vào CSDL PostgreSQL.

---

## 📚 API Documentation (Swagger UI)
Sau khi ứng dụng chạy thành công (mặc định ở cổng `8080`), bạn có thể truy cập tài liệu API tự động tại:
- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

Chúc bạn chạy dự án thành công!
