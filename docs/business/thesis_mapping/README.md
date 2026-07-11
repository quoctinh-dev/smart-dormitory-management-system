# THESIS MAPPING DIRECTORY (TÀI LIỆU LUẬN VĂN GỐC)

## 🎯 Mục đích của thư mục này
Thư mục `thesis_mapping` là nơi lưu trữ các văn bản phân tích nghiệp vụ, quyết định kiến trúc và giải pháp kỹ thuật **được viết sẵn dưới dạng Văn phong Học thuật (Academic Writing)**. 

Mục tiêu cốt lõi: **Copy - Paste trực tiếp vào quyển báo cáo Luận văn Tốt nghiệp**.
Tất cả các file trong này đóng vai trò là "Selling Points" (Các điểm ăn tiền) để show-off với Hội đồng bảo vệ về độ sâu của hệ thống, thiết kế hướng Domain-Driven Design (DDD), và các giải pháp tối ưu hóa hiệu năng/bảo mật.

## 📂 Cấu trúc tài liệu (Mục lục)
Các file được đánh số thứ tự tương ứng với các Chương/Phân hệ trong báo cáo luận văn:

- `01_auth_module.md`: Phân tích thiết kế của Module Xác thực và Phân quyền (Spring Security, JWT Stateless, Cấu trúc Role).
- `02_account_management_module.md`: Phân tích thiết kế của Module Quản lý tài khoản (Entity Segregation, Data Integrity, Soft Delete, Dynamic Query).
- *(Các file tiếp theo sẽ được bổ sung khi hoàn thành từng Module: Registration, Payment, IoT Smart Access, v.v.)*

## 📜 Nguyên tắc khi viết tài liệu vào thư mục này
1. **Academic Tone:** Không viết kiểu hướng dẫn kỹ thuật (How-to). Phải viết theo cấu trúc: Đặt vấn đề -> Phân tích -> Giải pháp -> Đánh giá ưu điểm.
2. **Justification (Lập luận):** Bất cứ một đoạn code hay thiết kế DB nào được đưa vào đây đều phải có lời giải thích "Tại sao lại chọn cách làm này thay vì cách thông thường?".
3. **No Code Dump:** Hạn chế nhúng quá nhiều code thô. Chỉ trích dẫn các đoạn mã quan trọng thể hiện rõ thuật toán hoặc tính năng (Ví dụ: Dynamic Query, Interceptor, Design Pattern).

---
*Lưu ý cho AI Agent: Khi user yêu cầu "lưu tài liệu để viết luận văn", bạn MẶC ĐỊNH phải sinh ra file `.md` tại thư mục này và tuân thủ chặt chẽ các nguyên tắc trên.*
