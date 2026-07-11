# KẾ HOẠCH DOCKER HÓA TOÀN DIỆN (FULL-STACK DOCKERIZATION)

## 1. VISION (Tầm nhìn)
Hiện tại dự án SDMS mới chỉ hỗ trợ Docker một phần (chỉ có Frontend, Backend và PostgreSQL). Tầm nhìn của tính năng này là mang đến khả năng "1 Click to Deploy" (Chạy 1 lệnh `docker-compose up -d` là toàn bộ hệ thống đứng lên) bao gồm cả AI Service và môi trường giao tiếp IoT (MQTT Broker). 

## 2. BUSINESS FLOW / ARCHITECTURE (Luồng kiến trúc)
Kiến trúc Container mong đợi:
- **`sdms-frontend` (Nginx):** Chạy Web UI ở cổng 80/443.
- **`sdms-backend` (Spring Boot):** Xử lý Core API ở cổng 8080.
- **`sdms-ai-service` (FastAPI):** Chạy AI model (Facenet) ở cổng 8000.
- **`postgres` (PostgreSQL 16):** Chạy Database ở cổng 5432.
- **`mosquitto` (Eclipse Mosquitto):** Chạy MQTT Broker ở cổng 1883 để Backend có luồng giao tiếp với mạch ESP32.
*(Lưu ý: Mã nguồn IoT ESP32 C++ được nạp trực tiếp vào chip vật lý nên không chạy bằng Docker).*

## 3. IMPLEMENTATION ROADMAP (Lộ trình triển khai)
- **Bước 1 (AI Service):** Viết `Dockerfile` cho `sdms-ai-service` sử dụng `python:3.10-slim`. Cài đặt các thư viện AI nặng như `torch`, `facenet-pytorch`, `opencv-python`.
- **Bước 2 (MQTT Broker):** Thêm image `eclipse-mosquitto` vào `docker-compose.yml`, tạo volume lưu cấu hình `mosquitto.conf` (cho phép anonymous access cục bộ).
- **Bước 3 (Docker Compose Integration):** Tích hợp AI Service vào `docker-compose.yml` gốc, cấu hình network cho Backend gọi được sang AI Service (`http://sdms-ai-service:8000`) và kết nối được vào MQTT (`tcp://mosquitto:1883`).
- **Bước 4 (Documentation):** Cập nhật `docs/DOCKER_GUIDE.md` để hướng dẫn chi tiết cách chạy hệ sinh thái hoàn chỉnh này.

---

## 🤖 BÙA CHÚ KÍCH HOẠT (TRIGGER PROMPT)
*Khi bạn muốn AI bắt tay vào lập trình tính năng này, hãy Copy và Paste đoạn Prompt sau vào khung chat:*

```text
Tiến hành thực thi tính năng: "DOCKER HÓA TOÀN DIỆN". 
Hãy đọc tài liệu `docs/roadmap/features/03_FULL_DOCKERIZATION.md` và file `docker-compose.yml` gốc. Nhiệm vụ của bạn là:
1. Tạo Dockerfile cho `sdms-ai-service`.
2. Khai báo thêm `sdms-ai-service` và `mosquitto` (MQTT Broker) vào `docker-compose.yml`.
3. Sửa lại các biến môi trường của `backend` để nó gọi sang `sdms-ai-service` và kết nối MQTT.
Code xong hãy hướng dẫn tôi cách test.
```
