# BATCH JOB DATA ARCHIVING & GRADUATION HANDLING

## 1. Vision (Tầm nhìn)
Tính năng nhằm tối ưu hóa hiệu suất và dọn dẹp không gian của CSDL (Database) mà vẫn đảm bảo tính toàn vẹn dữ liệu (Data Integrity) theo chuẩn phân tích thiết kế hệ thống chuyên sâu. Khi một khóa sinh viên tốt nghiệp (`GRADUATED`), hồ sơ cá nhân và tài khoản sẽ được nén, đưa vào khu vực lưu trữ (Archive) nhằm giảm tải cho các bảng truy vấn trực tiếp hằng ngày. Tính năng này cũng thể hiện năng lực thiết kế Cronjob/Batch Job tự động cho đồ án.

## 2. Business Flow (Luồng nghiệp vụ)
1. **Trigger:** Hệ thống thiết lập một Cronjob (Ví dụ: chạy vào 00:00 ngày 1 tháng 8 hằng năm).
2. **Scan (Quét):** Spring Boot Job quét tất cả các sinh viên có trạng thái `GRADUATED` và `INACTIVE` (đã quá thời hạn lưu trú 2 năm).
3. **Deactivate UserAccount:** Chuyển `isActive = false` cho UserAccount của sinh viên đó để chặn đăng nhập, nhưng tuyệt đối không Xóa (để giữ khóa ngoại của hóa đơn).
4. **Data Archiving (Lưu trữ lạnh) & Hard Delete:**
   - Chuyển các dữ liệu lịch sử nặng (như `access_history`, `notifications`) của sinh viên này sang bảng lưu trữ lạnh (Ví dụ: `access_history_archives`) hoặc Export ra file CSV đẩy lên Cloud Storage.
   - Sau khi sao lưu thành công, thực hiện **Xóa cứng (Hard Delete)** trực tiếp các record cũ này khỏi Database vận hành (Operational DB) để tối ưu tốc độ query hằng ngày.
5. **Notification:** Gửi Email thông báo (hoặc Notification nội bộ cho Admin) về báo cáo kết quả tiến trình dọn dẹp (VD: "Đã archive và tối ưu DB cho 500 sinh viên ra trường").

## 3. Implementation Roadmap (Lộ trình triển khai)

### Backend (sdms-backend)
- **Cấu hình Spring Batch/Scheduler:** Bật `@EnableScheduling` và tạo một lớp `StudentArchivingJob`.
- **Service Layer:** Viết method `@Scheduled(cron = "0 0 0 1 8 ?")` trong `StudentService`.
- **Query / JPA:** Viết query tối ưu để lấy ra list sinh viên `GRADUATED` và phân trang (batch processing) để tránh tràn RAM (OutOfMemory) khi xử lý hàng ngàn bản ghi.
- **Transaction Management:** Đảm bảo quá trình archive nằm trong Transaction, nếu lỗi ở 1 sinh viên thì roll-back đúng sinh viên đó chứ không chết toàn bộ Job.

### Database (PostgreSQL)
- (Tùy chọn) Tạo thêm các bảng dạng `[table_name]_archives` để chuyển dữ liệu lịch sử vào.

### Frontend (sdms-frontend)
- **Admin Dashboard / System Config:** Bổ sung một giao diện cho phép Admin xem lịch sử chạy Job, hoặc có một nút "Kích hoạt dọn dẹp dữ liệu ngay" (Trigger Job Manually) thay vì phải đợi đến lịch cron.

## 4. Trigger Prompt (Câu lệnh kích hoạt cho Agent trong tương lai)
Khi bạn sẵn sàng triển khai tính năng này, hãy copy câu lệnh dưới đây và gửi cho Agent:

```text
Xin chào Agent, hãy mở file tài liệu `docs/roadmap/features/001_DATA_ARCHIVING_AND_GRADUATION_JOB.md` và bắt đầu tiến hành code tính năng "Batch Job Data Archiving" cho sinh viên ra trường theo đúng Roadmap đã định. Vui lòng thiết lập Scheduler cho Backend trước và viết API cho phép Admin trigger Job này bằng tay.
```
