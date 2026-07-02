# Phân tích Mô hình Miền (Domain Model) Module Application
**Phiên bản:** 1.1 · **Ngày:** 2026-06-26

Tài liệu này phân tích chi tiết về các thực thể (Entities), Aggregate Root, và các mối quan hệ trong mô hình miền của module Application, nhằm đảm bảo tính toàn vẹn và nhất quán của nghiệp vụ.

---

## 1. Aggregate Root: `DormitoryApplication`
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 2. Phân tách Dữ liệu: Dữ liệu Nghiệp vụ vs. Dữ liệu Hồ sơ
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 3. Sơ đồ Thực thể và Mối quan hệ
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 4. Mô tả các Thực thể Phụ
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 5. Tích hợp và Tách biệt Module
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

---
## 6. Tuân thủ Nguyên tắc Thiết kế SSR

Thiết kế của Module `Application` thể hiện rõ sự tuân thủ các nguyên tắc cốt lõi đã được định nghĩa trong tài liệu SSR của hệ thống.

*   **Tuân thủ [Nguyên tắc 1: Tách biệt Module](./../overview/system-design-principles.md#nguyên-tắc-1-tách-biệt-module-nghiệp-vụ-decoupling-via-events):**
    *   Module `Application` được thiết kế để **KHÔNG** có bất kỳ sự phụ thuộc trực tiếp nào (ví dụ: `import` Repository) vào các module `Room` hay `Payment`.
    *   Khi một đơn được duyệt, module này chỉ có trách nhiệm phát ra một sự kiện duy nhất là `ApplicationApprovedEvent`. Nó "không biết" và "không quan tâm" đến việc giường sẽ được giữ như thế nào hay hóa đơn được tạo ra sao. Điều này đảm bảo tính linh hoạt và khả năng chịu lỗi của hệ thống.

*   **Tuân thủ [Nguyên tắc 3: Đối soát và Tự sửa lỗi](./../overview/system-design-principles.md#nguyên-tắc-3-đối-soát-và-tự-sửa-lỗi-reconciliation):**
    *   Các trạng thái cuối của đơn (`WAITING_PAYMENT`, `REJECTED`) và các mốc thời gian (`paymentDeadline`) là nguồn dữ liệu đầu vào quan trọng cho các Job đối soát. Ví dụ, một Job có thể chạy để tự động hủy các đơn `WAITING_PAYMENT` đã quá hạn, đảm bảo không có đơn nào bị "treo" vô thời hạn trong hệ thống.
