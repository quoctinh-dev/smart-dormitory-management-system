# Docker Guide Cho Smart Dormitory Management System

## 1. Docker trong dự án này dùng để làm gì?

Docker giúp chạy các thành phần của hệ thống trong các container tách biệt, để máy của bạn không cần cài thủ công quá nhiều thứ như PostgreSQL, Nginx, Maven hay Node theo đúng phiên bản.

Trong dự án này, Docker đã được cấu hình để phục vụ 2 nhu cầu:

1. Chạy toàn bộ hệ thống theo kiểu gần production.
2. Chạy môi trường phát triển để sửa code backend/frontend ngay trên máy.

## 2. Hiện tại Docker đã được làm những gì?

Các phần đã có sẵn:

1. `docker-compose.yml`
   File chính để chạy toàn bộ hệ thống gồm:
   - `postgres`: cơ sở dữ liệu PostgreSQL
   - `backend`: ứng dụng Spring Boot
   - `frontend`: ứng dụng React/Vite, build xong rồi phục vụ bằng Nginx

2. `docker-compose.dev.yml`
   File bổ sung cho môi trường phát triển:
   - backend chạy bằng Maven trong container
   - frontend chạy bằng Vite dev server trong container
   - mount source code từ máy vào container để sửa code và chạy lại nhanh hơn

3. `sdms-backend/Dockerfile`
   Dockerfile để build backend Java Spring Boot thành image chạy được.

4. `sdms-frontend/Dockerfile`
   Dockerfile nhiều bước:
   - build frontend bằng Node
   - sau đó copy bản build sang Nginx để chạy gọn và nhanh hơn

5. `sdms-frontend/nginx.conf`
   Cấu hình Nginx để frontend SPA vẫn hoạt động đúng khi refresh trang.

6. `.dockerignore`
   Đã thêm cho backend và frontend để tránh copy các file thừa như `node_modules`, `dist`, `target`, `.git` vào image.

7. File mẫu biến môi trường
   - `sdms-backend/.env.example`
   - `sdms-frontend/.env.example`

## 3. Kiến trúc chạy bằng Docker

Luồng chạy cơ bản:

1. Người dùng mở frontend ở cổng `5173`.
2. Frontend gọi API sang backend ở cổng `8080`.
3. Backend kết nối tới PostgreSQL trong container `postgres`.

Các cổng mặc định:

1. Frontend: `http://localhost:5173`
2. Backend: `http://localhost:8080`
3. PostgreSQL: `localhost:5434`

Lưu ý:

1. Trong Docker network, backend không dùng `localhost` để gọi database.
2. Backend dùng hostname service là `postgres`.

## 4. Khi nào dùng file nào?

### `docker-compose.yml`

Dùng khi bạn muốn chạy hệ thống theo kiểu ổn định, giống môi trường deploy hơn:

```powershell
docker compose up --build
```

Đặc điểm:

1. Frontend sẽ được build thành file tĩnh rồi chạy bằng Nginx.
2. Backend sẽ chạy từ image đã build.
3. Phù hợp để test toàn hệ thống.

### `docker-compose.dev.yml`

Dùng khi bạn đang lập trình và muốn sửa code liên tục:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Đặc điểm:

1. Backend chạy bằng `mvn spring-boot:run`.
2. Frontend chạy bằng `npm run dev`.
3. Source code trên máy được mount vào container.
4. Phù hợp khi đang phát triển tính năng.

## 5. Cần chuẩn bị gì trước khi chạy?

Bạn chỉ cần cài:

1. Docker Desktop
2. Docker Compose

Thường nếu đã cài Docker Desktop thì `docker compose` đã dùng được luôn.

Kiểm tra:

```powershell
docker --version
docker compose version
```

## 6. Cách chạy lần đầu

### Bước 1: tạo file môi trường nếu cần

Hiện tại compose đã có giá trị mặc định cho một số biến, nhưng để rõ ràng bạn nên tự tạo file `.env` ở thư mục gốc dự án nếu muốn đổi thông số.

Ví dụ nội dung tối thiểu:

```env
POSTGRES_DB=sdms_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
POSTGRES_PORT=5434
APP_FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:8080
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Nếu bạn chưa dùng email hoặc Cloudinary thì có thể để trống tạm, nhưng các chức năng liên quan có thể không hoạt động.

### Bước 2: chạy hệ thống

Chạy bản tiêu chuẩn:

```powershell
docker compose up --build
```

Hoặc chạy bản dev:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Bước 3: mở ứng dụng

1. Frontend: `http://localhost:5173`
2. Backend: `http://localhost:8080`

## 7. Cách dừng và xóa container

Dừng:

```powershell
docker compose down
```

Nếu chạy bằng file dev:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

Nếu muốn xóa luôn volume database:

```powershell
docker compose down -v
```

Lưu ý: lệnh có `-v` sẽ xóa dữ liệu PostgreSQL đã lưu trong Docker volume.

## 8. Dữ liệu database đang được lưu ở đâu?

PostgreSQL dùng Docker volume:

`sdms-postgres-data`

Nghĩa là:

1. Khi container tắt đi, dữ liệu vẫn còn.
2. Chỉ mất dữ liệu khi bạn xóa volume hoặc chủ động reset.

## 9. Một số lệnh hữu ích

Xem container đang chạy:

```powershell
docker ps
```

Xem log:

```powershell
docker compose logs -f
```

Xem log riêng backend:

```powershell
docker compose logs -f backend
```

Build lại sau khi sửa Dockerfile:

```powershell
docker compose up --build
```

Vào trong container backend:

```powershell
docker exec -it sdms-backend sh
```

Vào trong container database:

```powershell
docker exec -it sdms-postgres sh
```

## 10. Tài khoản mặc định để test

Trong backend hiện có dữ liệu seed cho môi trường không phải production:

1. Username: `admin`
2. Email: `admin@sdms.com`
3. Password: `admin123`

Nếu seed được chạy thành công, bạn có thể dùng tài khoản này để đăng nhập thử.

## 11. Các lỗi dễ gặp

### Cổng bị trùng

Nếu máy báo cổng `5173`, `8080` hoặc `5434` đang bận, bạn cần:

1. tắt ứng dụng đang chiếm cổng, hoặc
2. đổi cổng trong file `.env` hay compose

### Backend không kết nối được database

Kiểm tra:

1. container `postgres` đã chạy chưa
2. `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` có khớp không
3. backend phải dùng host là `postgres`, không phải `localhost`

### Frontend gọi sai API

Kiểm tra biến:

`VITE_API_URL`

Mặc định nên là:

`http://localhost:8080`

### Build frontend lỗi

Thường do:

1. thiếu biến môi trường
2. package chưa đồng bộ
3. code frontend đang lỗi build từ trước

## 12. Quy trình gợi ý cho bạn khi demo hoặc bàn giao

Nếu cần chạy nhanh để demo:

1. Mở Docker Desktop.
2. Đứng ở thư mục gốc dự án.
3. Chạy `docker compose up --build`.
4. Chờ database, backend, frontend khởi động xong.
5. Mở `http://localhost:5173`.

Nếu cần sửa code trong lúc làm đồ án:

1. Chạy `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`.
2. Sửa code trực tiếp trong `sdms-backend` hoặc `sdms-frontend`.
3. Theo dõi log để biết service có reload đúng chưa.

## 13. Kết luận ngắn

Phần Docker của dự án hiện tại đã đủ cho 2 mục tiêu chính:

1. chạy full hệ thống bằng một lệnh
2. có môi trường dev container cho backend và frontend

Nếu sau này cần hoàn thiện hơn, các hướng tiếp theo nên là:

1. thêm file `.env` mẫu ở thư mục gốc
2. thêm hướng dẫn backup/restore database
3. thêm cấu hình production rõ ràng hơn cho secret và domain
4. thêm CI để tự build image
