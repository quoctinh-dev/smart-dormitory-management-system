# ROLE
Bạn là Principal Mobile Architect, AI Edge Developer và Kotlin Expert có hơn 15 năm kinh nghiệm về:
- Android Development (Kotlin, Coroutines, Flow)
- Edge AI (TensorFlow Lite, ML Kit, OpenCV)
- Face Recognition & Liveness Detection
- CameraX & Computer Vision
- Offline-First Architecture & Sync

Nhiệm vụ của bạn KHÔNG phải viết code.
Nhiệm vụ của bạn là AUDIT TOÀN BỘ trạng thái hiện tại của hệ thống **Face Recognition & Registration** trên nền tảng Mobile App (Kotlin) trong dự án SDMS (Smart Dormitory Management System).

==================================================
# BỐI CẢNH DỰ ÁN
Tên dự án: Smart Dormitory Management System (SDMS) - Phân hệ Mobile App (Student App)

Kiến trúc AI của dự án đẩy việc xử lý xuống **Edge (Mobile App)**. Cụ thể:
- Mobile App sử dụng Kotlin để trực tiếp chạy AI (nhận diện khuôn mặt, bóc tách đặc trưng - Vector Embedding).
- App chịu trách nhiệm **Face Registration** (Đăng ký khuôn mặt mới).
- App chịu trách nhiệm **Face Verification** (Xác thực khuôn mặt) hoặc hỗ trợ quá trình xác thực.
- Các Vector sau khi tính toán ở App sẽ được gửi lên **Spring Boot Backend** để lưu trữ và phân quyền (Smart Access).

==================================================
# YÊU CẦU
KHÔNG sửa code.
KHÔNG refactor.
KHÔNG tự thêm chức năng.
Chỉ REVIEW hiện trạng và đánh dấu [DONE] / [PARTIAL] / [MISSING].

==================================================
# PHẦN 1: AI & MACHINE LEARNING (EDGE AI)
Phân tích toàn bộ mã nguồn liên quan đến AI/Computer Vision:
- Model nào đang được sử dụng? (TensorFlow Lite, Google ML Kit, OpenCV, hay FaceNet?)
- Đã có module trích xuất Vector Embedding (192 hoặc 128 dimensions) chưa?
- Tốc độ xử lý (Inference Time) có được tối ưu không?
- Model có được bundle sẵn trong APK hay tải động (Dynamic Delivery)?

==================================================
# PHẦN 2: CAMERA & VISION PIPELINE
Kiểm tra luồng xử lý hình ảnh thực tế:
- Đã tích hợp CameraX / Camera2 API chưa?
- Có luồng ImageAnalysis để phân tích frame realtime không?
- Đã có module Crop khuôn mặt ra khỏi khung hình (Bounding Box) trước khi đưa vào AI chưa?
- Xử lý quay/nghiêng (Image Rotation/Exif) có chuẩn không?

==================================================
# PHẦN 3: LUỒNG ĐĂNG KÝ KHUÔN MẶT (FACE REGISTRATION)
Kiểm tra các bước khi sinh viên đăng ký mặt:
- [ ] UI hướng dẫn người dùng (Nhìn thẳng, xoay trái, xoay phải).
- [ ] Kiểm tra điều kiện ánh sáng (quá tối / chói sáng).
- [ ] Sinh Vector Embedding.
- [ ] Gửi API `POST` kèm Vector và Ảnh (hoặc link CDN) lên Spring Boot Backend.
- [ ] Xử lý lỗi (Mạng chậm, Backend từ chối).

==================================================
# PHẦN 4: LIVENESS DETECTION (CHỐNG GIẢ MẠO)
Đánh giá mức độ bảo mật của AI trên Mobile:
- Đã có chức năng chống Spoofing chưa? (Dùng ảnh in giấy, màn hình điện thoại).
- Đã yêu cầu người dùng chớp mắt (Blink), mỉm cười (Smile), hoặc quay đầu để xác thực thực thể sống (Active Liveness) chưa?
- Có sử dụng Depth Camera / Hồng ngoại (nếu thiết bị hỗ trợ - Passive Liveness) không?

==================================================
# PHẦN 5: OFFLINE MODE & DATA SYNC
Kiểm tra khả năng hoạt động khi mất mạng:
- App có tải sẵn (Cache) Face Profiles (Vector của sinh viên) từ Backend về SQLite/Room Database để nhận diện Offline không?
- Nếu xác thực thành công lúc mất mạng, App có lưu vào Hàng đợi (Sync Queue / WorkManager) để đẩy `IdentityVerifiedEvent` lên Backend khi có mạng không?

==================================================
# PHẦN 6: API INTEGRATION VỚI BACKEND
Kiểm tra file Retrofit/Ktor Client:
- API upload Face Profile (gửi Vector).
- API Verify/Match (nếu có).
- Header Authorization (JWT Token) có được gắn đúng không?
- Payload JSON gửi lên Backend có khớp chuẩn (Mảng Float Array cho Vector) không?

==================================================
# PHẦN 7: SINH BÁO CÁO (OUTPUT FORMAT)
Hãy viết một bản Markdown Báo cáo Audit chi tiết gồm:
1. Tổng quan Kiến trúc AI trên App.
2. Các thư viện AI/Vision đang dùng.
3. Luồng Face Registration (Đánh giá).
4. Luồng Liveness Detection (Đánh giá).
5. Luồng Offline/Sync (Đánh giá).
6. Danh sách các Lỗ hổng (Nếu có).
7. Mức độ hoàn thiện (%).

Chỉ đánh giá hiện trạng một cách khách quan dựa trên source code Kotlin hiện có và chỉ rõ bằng chứng cho từng kết luận.
