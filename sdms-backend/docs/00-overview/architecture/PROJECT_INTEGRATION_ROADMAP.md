# PROJECT-INTEGRATION-ROADMAP: Chiến Lược Phát Triển & Tích Hợp Hệ Thống SDMS

## 1. Tóm tắt Trạng thái (Executive Summary)
Hệ thống SDMS (Smart Dormitory Management System) hiện đang sở hữu một **Backend lõi cực kỳ vững chắc**, tuân thủ nghiêm ngặt các quy chuẩn Clean Architecture, Event-Driven và CQRS. Mọi nền móng về Database (PostgreSQL + pgvector), Bảo mật, và Luồng nghiệp vụ (10 Modules) đã được hoàn thiện 95%.

Tuy nhiên, hệ thống đang khuyết thiếu các **"Điểm chạm" (Touchpoints)** ở tầng ngoài cùng, bao gồm Giao diện người dùng (Web/Mobile), Hệ thống phần cứng (IoT), và Động cơ xử lý (AI). 

Bản báo cáo này vạch ra chiến lược để tích hợp các mảnh ghép còn thiếu này vào Backend một cách hoàn hảo nhất.

---

## 2. Chiến lược Tích hợp Động cơ AI (Face Recognition Sidecar)
**Tình trạng:** Backend đã có `AiExtractionPort` và `RestAiExtractionAdapter` (hiện đang trả về Mock data).
**Mục tiêu:** Có một service thực sự trích xuất được Vector từ ảnh thật.

**Cách Tích hợp:**
1. **Công nghệ:** Xây dựng một Microservice độc lập bằng **Python (FastAPI)**. Lý do: Python có hệ sinh thái AI tốt nhất (PyTorch, TensorFlow, InsightFace).
2. **Luồng hoạt động (Workflow):**
   - Sinh viên upload ảnh lên Backend. Backend lưu file vào Cloudinary và lấy URL.
   - Backend gọi HTTP POST tới Python Sidecar: `POST http://localhost:8000/api/v1/faces/extract` với payload `{"image_url": "..."}`.
   - Python Sidecar tải ảnh về, chạy mô hình AI (vd: `Facenet512` hoặc `ArcFace`), chuyển khuôn mặt thành mảng số thực.
   - Python Sidecar trả về mảng `float[512]` cho Backend.
   - Backend lưu mảng này vào PostgreSQL qua kiểu dữ liệu `vector(512)` của `pgvector`.
3. **Tiếp theo:** Xóa dòng code tạo Mock Vector trong `RestAiExtractionAdapter` và mở comment đoạn gọi `RestTemplate`.

---

## 3. Chiến lược Tích hợp IoT (Smart Access Gateway)
**Tình trạng:** Backend đã thiết kế API kiểm tra điều kiện mở cửa và luồng MQTT, nhưng chưa có cổng quét thực tế.
**Mục tiêu:** Cửa tự động mở khi sinh viên đứng trước Camera/Quẹt thẻ.

**Cách Tích hợp:**
1. **Công nghệ Thiết bị:** Sử dụng Raspberry Pi hoặc ESP32 kết nối với Camera và Servo Motor (chốt cửa).
2. **Luồng Quét (Inbound):** 
   - Thiết bị IoT chụp ảnh người đang đứng trước cửa (hoặc đọc mã RFID).
   - Thiết bị gửi HTTP POST về Backend: `POST /api/v1/access/gates/{gateId}/scan` đính kèm ảnh chụp.
   - Backend đẩy ảnh qua AI Sidecar để lấy Vector, sau đó so sánh độ tương đồng (Cosine Similarity) bằng lệnh SQL của `pgvector` để tìm ra Sinh viên.
   - Backend kiểm tra Giờ giới nghiêm (Curfew Policy), Trạng thái lưu trú. Nếu hợp lệ, lưu lịch sử `AccessGrantedEvent`.
3. **Luồng Mở Cửa (Outbound qua MQTT):**
   - Cài đặt một MQTT Broker (như Mosquitto / EMQX).
   - Thiết bị IoT Subscribe (lắng nghe) vào topic `dormitory/gates/{gateId}/commands`.
   - Khi Backend quyết định cho phép vào, Backend Publish một bản tin `{"action": "UNLOCK", "duration_sec": 5}` vào topic trên.
   - Thiết bị IoT nhận bản tin và kích hoạt rơ-le mở cửa trong 5 giây.

---

## 4. Chiến lược Tích hợp Giao diện Web (Admin & Public Portal)
**Tình trạng:** `sdms-frontend` (React/Vite) đã có khung cơ bản, chia làm 2 luồng: Public (cho Sinh viên) và Admin.
**Mục tiêu:** Cung cấp cổng thông tin toàn diện trên Web.

**Cách Tích hợp:**
1. **Public Portal (Sinh viên):** Tiếp tục phát triển trong thư mục `sdms-frontend/src/pages/public/`.
   - **Đăng ký Lưu trú:** Trang cho phép sinh viên chọn đợt đăng ký, nạp thông tin cá nhân và nộp đơn (đã có khung `RegistrationPage.jsx`). Cần nối API `POST /api/v1/applications/submit`.
   - **Tra cứu trạng thái:** Cho phép sinh viên nhập CCCD/Mã SV để xem đơn đã được duyệt chưa (`StatusPage.jsx`).
2. **Admin Portal (Ban quản lý):** Phát triển trong `sdms-frontend/src/pages/admin/`.
   - **Face Approval Queue:** Danh sách Sinh viên chờ duyệt ảnh khuôn mặt. Tích hợp nút Gọi API `POST /api/v1/admin/faces/{id}/approve`.
   - **Smart Access Dashboard:** Bảng điều khiển Real-time xem lịch sử ra vào. Gắn nút "Mở Cửa Khẩn Cấp" gọi API `POST /api/v1/access/gates/{id}/unlock`.
   - **Financial Dashboard:** Hiển thị biểu đồ thanh toán, kết nối với API `/api/v1/payment/*`.

---

## 5. Chiến lược Phát triển Mobile App (Sinh viên)
**Tình trạng:** Chưa tồn tại Codebase.
**Mục tiêu:** App trên điện thoại để sinh viên thao tác tiện lợi.

**Cách Tích hợp:**
1. **Công nghệ:** Nên khởi tạo một dự án **React Native** (hoặc Flutter) mới.
2. **Quy tắc Giao tiếp:** Mobile App **CHỈ** được phép gọi các API có tiền tố `/api/v1/students/me/*`. Mọi API bắt đầu bằng `/admin` đều bị chặn bởi JWT Context.
3. **Tính năng cốt lõi cần làm:**
   - Upload ảnh FaceProfile (truy cập Camera điện thoại).
   - Xem mã QR cá nhân (dùng làm phương án dự phòng mở cửa nếu AI lỗi).
   - Thanh toán hóa đơn (nhúng link chuyển khoản hoặc quét mã VietQR).

---

## 6. Lộ trình Triển khai Đề xuất (Roadmap)

Để đưa dự án đến trạng thái Demo Hoàn hảo nhất, hãy làm theo thứ tự sau:

*   **Phase 1 (Mocking Demo):** Hoàn thiện nốt Admin Web Frontend. Viết 2 script Python giả lập IoT gửi request và giả lập AI trả về vector ảo. Điều này đủ để Demo Luồng dữ liệu (Data Flow) từ đầu đến cuối mà không cần phần cứng thật.
*   **Phase 2 (AI Integration):** Dựng Python FastAPI Sidecar thật, train/load model FaceNet và thay thế script Mock.
*   **Phase 3 (Hardware Reality):** Mua thiết bị ESP32/Raspberry Pi, cài Mosquitto MQTT, code C++ cho phần cứng và cắm điện chạy thật.
*   **Phase 4 (Mobile UX):** Xây dựng Student Mobile App để hoàn thiện hệ sinh thái đa kênh.
