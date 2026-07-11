# THESIS DEPTH RULE (LUẬT CHIỀU SÂU LUẬN VĂN)

Tài liệu này định nghĩa các quy tắc bắt buộc về mặt Nghiệp vụ và Cơ sở dữ liệu (Database) để đảm bảo dự án đạt chuẩn "chiều sâu" của một Luận văn Tốt nghiệp xuất sắc. Mọi Agent khi thực hiện tính năng, viết code hoặc thay đổi cấu trúc dữ liệu đều phải tuân thủ tuyệt đối.

## 1. MỤC TIÊU CỦA QUY TẮC
- Ngăn chặn việc tạo ra "dữ liệu rác" (Garbage Data) hoặc dữ liệu mồ côi (Orphan Data).
- Đảm bảo tính toàn vẹn của dữ liệu lịch sử phục vụ cho truy xuất, báo cáo và giải trình (Audit).
- Tối ưu hiệu năng truy vấn cho hệ thống.
- Đảm bảo mọi tính năng (đặc biệt là CRUD) đều phản ánh đúng nghiệp vụ quản lý thực tế khắt khe.

## 2. QUY TẮC CƠ SỞ DỮ LIỆU (DATABASE STRICTNESS)

### 2.1. Không bao giờ Xóa vật lý (NO HARD DELETE)
- **Luật:** Cấm sử dụng câu lệnh `DELETE` trong SQL để xóa dữ liệu nghiệp vụ.
- **Giải pháp (Soft Delete):** Mọi bảng (Table) nghiệp vụ phải có trường `is_deleted` (boolean, mặc định false) hoặc trường `status` (enum, có trạng thái INACTIVE/DELETED).
- **Ngoại lệ:** Chỉ cho phép Hard Delete đối với các bảng lưu trữ phiên bản tạm (Token tạm thời, Log rác, Session hết hạn) có kịch bản dọn dẹp tự động định kỳ (Cronjob).

### 2.2. Dấu vết Kiểm toán (AUDIT TRAIL)
- Mọi entity cốt lõi (User, Hợp đồng, Hóa đơn, Thẻ từ) bắt buộc phải có ít nhất 4 trường Audit chuẩn: 
  - `created_at` (Thời điểm tạo)
  - `created_by` (Người tạo)
  - `updated_at` (Thời điểm cập nhật cuối)
  - `updated_by` (Người cập nhật cuối)
- Đối với các thay đổi trạng thái nhạy cảm (VD: Hủy hợp đồng, Khóa thẻ từ, Thay đổi số tiền hóa đơn), phải có **Bảng Lịch sử riêng** (VD: `contract_history_logs`) lưu lại: Thời gian, ID người thực hiện, Hành động, Dữ liệu cũ, Dữ liệu mới.

### 2.3. Tính Toàn vẹn Giao dịch (TRANSACTIONS)
- Bất kỳ API hoặc Function nào thực hiện từ 2 thao tác ghi (INSERT/UPDATE/DELETE) trở lên trên các bảng khác nhau phải được bọc trong một **Database Transaction** (`@Transactional` trong Spring Boot, hoặc Query Runner trong Node.js/TypeORM).
- Đảm bảo tính chất ACID: Nếu một bước thất bại, toàn bộ quá trình phải Rollback.

### 2.4. Khóa và Ràng buộc (KEYS & CONSTRAINTS)
- Sử dụng Foreign Keys (Khóa ngoại) hợp lý để ràng buộc dữ liệu.
- Phải bắt lỗi `DataIntegrityViolationException` ở phía Backend và trả về thông báo lỗi có ý nghĩa cho Frontend (Không văng mã lỗi SQL 500 ra ngoài).

## 3. QUY TẮC NGHIỆP VỤ (BUSINESS LOGIC)
- **CRUD Không Đơn Giản:** Việc Thêm/Sửa/Xóa một thực thể không chỉ là lưu vào DB. Phải phân tích các side-effects (hiệu ứng phụ). *Ví dụ: Xóa một phòng -> Những sinh viên trong phòng đó sẽ đi đâu? Hóa đơn của phòng đó xử lý thế nào?*
- **Validation Nhiều Lớp:**
  - Lớp 1: Validate phía Client (Frontend/App).
  - Lớp 2: Validate phía Controller (Format dữ liệu, Regex).
  - Lớp 3: Validate phía Service/Business Logic (Kiểm tra logic nghiệp vụ: Sinh viên đã có phòng chưa? Phòng đã đầy chưa?).
- **Luôn tự hỏi:** "Nếu User cố tình thao tác sai/chọc phá, dữ liệu có bị rác không?". Trả lời "Có" => Phải code chặn lại.

### 3.3. Khai báo Phân quyền API (API Authorization)
- Bắt buộc mọi API Endpoint (`@GetMapping`, `@PostMapping`, v.v.) ngoại trừ Auth đều phải gắn `@PreAuthorize` để xác định rõ Role (Vai trò) hoặc Authority (Quyền hạn).
- Khi hoàn thành 1 Module, Agent bắt buộc phải lập **Ma trận phân quyền API (API Permission Matrix)** vào file `thesis_mapping` của module đó. Không được để sót bất kỳ API nào ở trạng thái "Public" mà không có lý do chính đáng.

## 4. QUY TẮC ÁP DỤNG KHI TẠO MODULE MỚI
Mỗi khi bắt đầu một Module mới, Agent phải tạo file `docs/business/thesis_mapping/XX_[TenModule].md` để phân tích:
1. Mô hình thực thể (ERD/Models).
2. Các quy trình CRUD và cách xử lý dữ liệu liên quan.
3. Các lỗ hổng dữ liệu có thể xảy ra và cách phòng chống.
4. Ánh xạ vào Chương nào trong Luận văn.
