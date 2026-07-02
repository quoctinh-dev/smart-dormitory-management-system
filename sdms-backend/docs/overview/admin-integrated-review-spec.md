# Đặc tả Kỹ thuật Giao diện Duyệt Đơn (Admin Integrated Review Spec)

Tài liệu này cung cấp hướng dẫn chi tiết dành cho phân hệ Frontend để phát triển giao diện duyệt đơn tập trung trên Web Admin, bao gồm việc gom chung luồng duyệt Tân sinh viên và Sinh viên gia hạn lưu trú vào cùng một trang thông qua kiến trúc Multi-Tab.

## 1. Kiến trúc Giao diện đề xuất (UI Architecture)

Frontend cần thiết kế một trang duy nhất với tên gọi **"Quản lý xét duyệt đơn từ KTX"** (hoặc "Duyệt Đơn").
Trên trang này, giao diện sẽ được chia làm 2 Tab điều hướng chính để Admin có thể dễ dàng chuyển đổi qua lại giữa các luồng nghiệp vụ:

* **Tab 1: Duyệt đơn Đăng ký mới (Tân sinh viên)**
  * Hiển thị danh sách các đơn đăng ký lưu trú mới.
  * Xử lý các nghiệp vụ duyệt, từ chối, yêu cầu cập nhật hồ sơ (nếu có).
* **Tab 2: Duyệt đơn Gia hạn chỗ ở (Cư dân hiện tại)**
  * Hiển thị danh sách các đơn xin gia hạn lưu trú của sinh viên đang ở trong KTX.
  * Xử lý nghiệp vụ đồng ý gia hạn hoặc từ chối.

---

## 2. Đặc tả API dành cho Frontend (API Contracts)

Dưới đây là chi tiết các API tích hợp tương ứng cho mỗi Tab dựa trên mã nguồn backend thực tế:

### 2.1. Tab 1: Duyệt đơn Đăng ký mới (Tân sinh viên)
* **Lấy danh sách đơn (Phân trang):**
  * **Endpoint:** `GET /api/v1/admin/applications`
  * **Query Parameters:** `page` (trang hiện tại, mặc định 0), `size` (số lượng trên mỗi trang, mặc định 10).
* **Xử lý duyệt đơn:**
  * **Endpoint:** `PATCH /api/v1/admin/applications/{applicationId}/approve`
  * **Payload:** `{ "note": "string" }`
* **Xử lý từ chối đơn:**
  * **Endpoint:** `PATCH /api/v1/admin/applications/{applicationId}/reject`
  * **Payload:** `{ "note": "string" }`

### 2.2. Tab 2: Duyệt đơn Gia hạn chỗ ở (Cư dân hiện tại)
* **Lấy danh sách đơn (Phân trang):**
  * **Endpoint:** `GET /api/v1/admin/extensions`
  * **Query Parameters:** `page` (trang hiện tại, mặc định 0), `size` (số lượng trên mỗi trang, mặc định 10).
* **Xử lý duyệt/từ chối đơn:**
  * **Endpoint:** `PUT /api/v1/admin/extensions/{id}/status`
  * **Payload:** 
    ```json
    {
      "status": "APPROVED", // Hoặc "REJECTED"
      "rejectReason": "Lý do từ chối (bắt buộc nếu REJECTED)"
    }
    ```

---

## 3. Hướng dẫn Tái sử dụng Component Bảng (Data Mapping & Reusability)

Cấu trúc trả về của `ApplicationResponse` (Đăng ký mới) và `StayExtensionResponse` (Gia hạn) có độ tương đồng cao. Frontend nên xây dựng một **Shared Table Component** (Bảng dùng chung) và truyền cấu hình cột động thay vì code cứng 2 bảng tách biệt.

### Ánh xạ dữ liệu giữa 2 luồng:
| Cột Hiển Thị | Nguồn dữ liệu Tab 1 (`ApplicationResponse`) | Nguồn dữ liệu Tab 2 (`StayExtensionResponse`) |
| :--- | :--- | :--- |
| **ID Đơn** | `applicationId` | `extensionId` |
| **Định danh sinh viên** | `cccd` | `studentCode` |
| **Họ và tên** | `fullName` | `fullName` |

### Quy tắc hiển thị trạng thái (Status Badge):
Để đảm bảo trải nghiệm người dùng nhất quán, Frontend cần áp dụng chung một bộ màu sắc cho thẻ hiển thị trạng thái của cả hai Tab:
* `PENDING` (Đang chờ duyệt): **Màu Vàng (Warning)**
* `APPROVED` (Đã duyệt): **Màu Xanh lá (Success)**
* `REJECTED` (Đã từ chối): **Màu Đỏ (Danger)**
