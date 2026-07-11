# SDMS AI Service (Face Extraction Engine)

Microservice chịu trách nhiệm trích xuất đặc trưng khuôn mặt (Feature Extraction) cho hệ thống Smart Dormitory Management System (SDMS). 

Được thiết kế hoàn toàn độc lập, giao tiếp với Backend Java (Spring Boot) thông qua REST API.

## 🌟 Nâng cấp cốt lõi (Kiến trúc 512-Dimension)
Hệ thống AI đã được nâng cấp hoàn toàn từ 192 chiều (chuẩn cũ của MobileFaceNet) lên **512 chiều** để đạt độ chính xác tương đương các hệ thống eKYC thương mại:
1. **Face Detection & Alignment:** Sử dụng `MTCNN` (Multi-task Cascaded Convolutional Networks) để phát hiện khuôn mặt với độ chính xác cao và tự động căn chỉnh (cắt góc, xoay mặt).
2. **Feature Extraction:** Sử dụng `InceptionResnetV1` (Train trên tập dữ liệu VGGFace2) qua thư viện `facenet-pytorch` để bóc tách khuôn mặt thành mảng **512 số thực (Float Array)**.

---

## 🚀 Hướng dẫn Cài đặt & Chạy (Dành cho Developer/Bạn của bạn)

Vì dự án sử dụng `PyTorch`, bạn nên chạy trong môi trường ảo (Virtual Environment) để tránh xung đột thư viện của máy.

### Bước 1: Tạo môi trường ảo (Virtual Environment)
Mở Terminal/Command Prompt tại thư mục `sdms-ai-service`:
```bash
python -m venv venv
```
Kích hoạt môi trường (Windows):
```bash
venv\Scripts\activate
```
Kích hoạt môi trường (Mac/Linux):
```bash
source venv/bin/activate
```

### Bước 2: Cài đặt thư viện
```bash
pip install -r requirements.txt
```
*(Lưu ý: Quá trình cài đặt `torch` và `torchvision` có thể mất vài phút vì thư viện khá nặng khoảng vài GB)*. Lần đầu tiên chạy file `main.py`, hệ thống sẽ tự động tải file model weights từ internet về máy (khoảng 100MB).

### Bước 3: Khởi động Server
Chạy lệnh sau để khởi động FastAPI trên cổng 8000 và **mở luồng mạng ra ngoài (0.0.0.0)** để máy tính khác (hoặc điện thoại) có thể gọi vào:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Thấy dòng `Application startup complete.` là thành công!

---

## 📖 API Documentation (Swagger UI)
Sau khi bật Server, bạn mở trình duyệt và truy cập:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)** 

Giao diện Swagger sẽ hiện ra. Bạn có thể bấm nút **Try it out** ở API `POST /api/v1/faces/extract`, chọn một file ảnh mặt người tải từ máy tính lên và bấm Execute để test thử trực tiếp.

### Cấu trúc dữ liệu trả về (JSON)
Thành công:
```json
{
  "success": true,
  "message": "Face extracted successfully",
  "data": {
    "vector": [0.0123, -0.0456, 0.7890, ... (đúng 512 phần tử)]
  }
}
```

Thất bại (Không có mặt người / Bị che quá nửa mặt / Mờ):
**Mã HTTP 400 Bad Request**
```json
{
  "success": false,
  "message": "No face detected in the image. Khuôn mặt quá nhỏ, bị che khuất hoặc không có thật.",
  "data": null
}
```

---

## 🛠 Cấu trúc thư mục (Sạch & Chuẩn hóa)
- `main.py`: Chứa toàn bộ Logic khởi tạo Model và API Endpoints.
- `requirements.txt`: Danh sách các thư viện cần thiết.
- `PROJECT_RULE.md`: Hiến pháp và luật code AI của SDMS.
- `.agents/AGENTS.md`: Định tuyến và hướng dẫn cho AI Agent.
