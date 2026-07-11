# ĐỊNH HƯỚNG TƯƠNG LAI: CHIẾN LƯỢC LƯU TRỮ VÀ DỌN DẸP DỮ LIỆU (DATA RETENTION & ARCHIVING)

## 1. Tầm nhìn (Vision)
Trong hệ thống hiện tại, cơ chế **Soft Delete** (`is_deleted = true`) được áp dụng xuyên suốt 28 bảng để đảm bảo tính toàn vẹn dữ liệu (Data Integrity) và phục hồi khi xóa nhầm. Tuy nhiên, qua nhiều năm hoạt động, hàng chục ngàn sinh viên ra trường, dữ liệu log (thẻ từ, khuôn mặt, hóa đơn) sẽ phình to gây quá tải Database (Storage Overflow) và giảm hiệu năng truy vấn. 

Chiến lược **Data Retention & Archiving** (Vòng đời dữ liệu) được đề xuất để tự động dọn dẹp dữ liệu rác, duy trì hiệu năng hệ thống ở mức tối ưu mà vẫn đảm bảo luật lưu trữ hồ sơ.

## 2. Business Flow (Luồng nghiệp vụ)
Dữ liệu trong hệ thống sẽ trải qua 3 giai đoạn:
1. **Active (Sử dụng):** Dữ liệu đang hoạt động bình thường.
2. **Soft Deleted (Thùng rác tạm):** Dữ liệu bị người dùng xóa (`is_deleted = true`). Vẫn nằm trong Database chính để Admin có thể "Restore" nếu cần. Thời gian lưu giữ: **6 tháng**.
3. **Archived / Hard Deleted (Lưu trữ lạnh / Xóa vĩnh viễn):** 
   - **Xóa vĩnh viễn:** Đối với dữ liệu rác không quan trọng (Log thông báo, Session Login, Token hết hạn, Application nháp).
   - **Lưu trữ lạnh (Archiving):** Đối với dữ liệu kế toán (Hóa đơn, Thanh toán, Hợp đồng lưu trú). Dữ liệu này sẽ được Spring Batch chạy ngầm vào ban đêm để copy sang một Database khác (Data Warehouse) hoặc xuất ra file CSV đẩy lên AWS S3, sau đó mới `Hard Delete` khỏi DB chính.

## 3. Implementation Roadmap (Lộ trình triển khai)
- **Backend (Spring Boot):**
  - Tích hợp **Spring Batch** và `@Scheduled` Cron Job (chạy vào 2h sáng Chủ Nhật hàng tuần).
  - Viết Job quét các record có `is_deleted = true` và thời gian cập nhật `updated_at < (hiện tại - 6 tháng)`.
  - Thực thi lệnh `DELETE` cứng (Hard delete).
- **Database (PostgreSQL):**
  - Thiết lập cơ chế Table Partitioning theo năm (VD: `payments_2025`, `payments_2026`) để drop nguyên bảng cũ thay vì dùng lệnh DELETE từng dòng (tối ưu tốc độ DB).

## 4. Giá trị đối với Luận văn (Thesis Depth)
Phần này sẽ được đưa vào chương **"Hạn chế của hệ thống và Hướng phát triển tương lai"**. 
Việc sinh viên nhận thức được giới hạn của Soft Delete và tự đề xuất được kiến trúc Data Archiving / Table Partitioning sẽ chứng minh tư duy hệ thống (System Design) ở mức độ Senior/Architect, ghi điểm tuyệt đối trước hội đồng phản biện.

---

## 5. TRIGGER PROMPT (Dành cho AI Agent khi tiến hành code tính năng này)
*Lưu ý: Chỉ dùng Prompt này trong tương lai khi có yêu cầu triển khai thực tế tính năng dọn rác DB.*

> "Chào Agent, hãy thiết lập Module Data Retention. Yêu cầu:
> 1. Tạo một cron job `@Scheduled(cron = "0 0 2 * * SUN")` trong Spring Boot.
> 2. Viết logic xóa vĩnh viễn (Hard Delete) các tài khoản UserAccount, Notification, và CheckoutRequest có `is_deleted = true` quá 6 tháng.
> 3. Tạo một bảng log `cleanup_histories` để ghi lại số lượng record đã xóa mỗi lần chạy.
> 4. Tuyệt đối không xóa bảng `payments` và `bills` (Dữ liệu tài chính cần cấu hình Archiving sang file CSV sau)."
