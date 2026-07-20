# Hướng dẫn Đăng ký và Tích hợp API Key FPT.AI (OCR CCCD)

Để đồ án hoàn toàn **KHÔNG SỬ DỤNG MOCK DATA**, hệ thống đã được khóa chặt: nếu không có API Key thật, chức năng Quét CCCD sẽ báo lỗi.

Bạn hãy làm theo các bước sau để lấy API Key miễn phí từ FPT.AI và đưa vào dự án:

## Bước 1: Đăng ký tài khoản FPT.AI
1. Truy cập trang chủ: [https://console.fpt.ai/](https://console.fpt.ai/)
2. Nhấn **Đăng ký** (hoặc Đăng nhập nếu có tài khoản rồi). Bạn có thể dùng Gmail để đăng nhập cho nhanh.

## Bước 2: Tạo Project & Lấy API Key
1. Sau khi đăng nhập, tại màn hình Console, nhấn nút **"Create Project"** (Tạo dự án mới).
2. Đặt tên dự án là: `SDMS_Graduation_Thesis` (hoặc tùy ý).
3. Trong giao diện của Project vừa tạo, tìm mục **Vision** (hoặc Nhận dạng hình ảnh / eKYC).
4. Bạn sẽ thấy một mục là **API Key** (hoặc Token). Nhấn copy dải ký tự này.

## Bước 3: Đưa API Key vào hệ thống Backend
1. Mở file cấu hình Backend của bạn tại: `sdms-backend/src/main/resources/application.yml`
2. Kéo xuống dưới cùng (hoặc tìm mục config), thêm dòng sau:
```yaml
fpt:
  ai:
    api-key: "DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY"
```
*(Lưu ý: Nhớ thụt đầu dòng đúng chuẩn YAML)*

## Bước 4: Khởi động lại Backend
Sau khi dán API Key và lưu file `application.yml`, hãy khởi động lại Backend (Chạy lại `mvn spring-boot:run` hoặc restart lại từ IDE).

---
**Cơ chế hoạt động thực tế của Backend hiện tại:**
Khi Frontend gửi ảnh mặt trước CCCD lên, file `FptAiOcrService.java` của chúng ta sẽ gửi tấm ảnh đó thẳng tới Server của FPT. FPT sẽ đọc và trả về Họ Tên, Ngày Sinh, Quê Quán, Số CCCD một cách chính xác nhất và đổ lại vào Frontend cho sinh viên. Máy chủ Backend của chúng ta đóng vai trò trung gian bảo mật API Key!
