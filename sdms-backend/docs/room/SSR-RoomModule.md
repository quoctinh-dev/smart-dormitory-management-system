# SSR - Module Quản lý Phòng (Room)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Quản lý Phòng.

---

## 1. Tổng quan Chức năng

Module này chịu trách nhiệm quản lý toàn bộ cơ sở vật chất (tòa nhà, tầng, phòng, giường) và vòng đời phân phòng, cư trú của sinh viên.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-ROOM-MGMT]: Quản lý Cơ sở vật chất
- **[FR-ROOM-001] Quản lý Tòa nhà (Building):**
    - **Mô tả:** Hệ thống **Phải** cung cấp các giao diện cho Admin để thực hiện các thao tác Tạo, Đọc, Cập nhật, Xóa (CRUD) đối với các tòa nhà.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`.
    - **Hậu điều kiện:** Thông tin của tòa nhà được cập nhật trong CSDL.
- **[FR-ROOM-002] Quản lý Tầng (Floor):**
    - **Mô tả:** Hệ thống **Phải** cung cấp các giao diện cho Admin để thực hiện CRUD đối với các tầng trong một tòa nhà.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`. Một tòa nhà đã tồn tại.
    - **Hậu điều kiện:** Thông tin của tầng được cập nhật trong CSDL.
- **[FR-ROOM-003] Quản lý Phòng (Room):**
    - **Mô tả:** Hệ thống **Phải** cung cấp các giao diện cho Admin để thực hiện CRUD đối với các phòng trong một tầng.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`. Một tầng đã tồn tại.
    - **Hậu điều kiện:** Thông tin của phòng được cập nhật trong CSDL.
- **[FR-ROOM-004] Quản lý Giường (Bed):**
    - **Mô tả:** Hệ thống **Phải** cung cấp các giao diện cho Admin để thực hiện CRUD đối với các giường trong một phòng.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`. Một phòng đã tồn tại.
    - **Hậu điều kiện:** Thông tin của giường được cập nhật trong CSDL.

### Nhóm [FR-ROOM-ASSIGN]: Quản lý Vòng đời Cư trú
- **[FR-ROOM-010] Tự động Giữ chỗ (Reservation):**
    - **Mô tả:** Hệ thống **Phải** tự động tìm một giường trống phù hợp và tạo một bản ghi `StudentHousingAssignment` khi nhận được sự kiện `ApplicationSubmittedEvent`.
    - **Tiền điều kiện:** Một sự kiện `ApplicationSubmittedEvent` được phát ra (ngay khi sinh viên nộp đơn). Có giường trống phù hợp với giới tính và các tiêu chí khác.
    - **Hậu điều kiện:**
        1. Một bản ghi `StudentHousingAssignment` được tạo với trạng thái `RESERVED`.
        2. Trạng thái của `Bed` tương ứng được chuyển thành `RESERVED`.
        3. Hệ thống **Nên** phát ra sự kiện `BedReservedEvent` để các module khác (ví dụ: `Payment`) xử lý. (Tuân thủ [NFR-ARC-01])
- **[FR-ROOM-011] Xác nhận Nhận phòng (Check-in):**
    - **Mô tả:** Hệ thống **Phải** cho phép Admin xác nhận sinh viên đã nhận phòng.
    - **Tiền điều kiện:** Sinh viên đã thanh toán thành công (lắng nghe sự kiện `PaymentSuccessEvent`). `StudentHousingAssignment` đang ở trạng thái `RESERVED`.
    - **Hậu điều kiện:**
        1. Trạng thái của `StudentHousingAssignment` được chuyển thành `ACTIVE`.
        2. Trạng thái của `Bed` tương ứng được chuyển thành `OCCUPIED`.
        3. Hệ thống **Nên** phát ra sự kiện `CheckInCompletedEvent`.
- **[FR-ROOM-012] Tự động Hủy giữ chỗ:**
    - **Mô tả:** Hệ thống **Phải** tự động hủy việc giữ chỗ nếu sinh viên không thanh toán đúng hạn.
    - **Tiền điều kiện:** Một sự kiện `PaymentExpiredEvent` (hoặc tương đương) được phát ra từ module `Payment`.
    - **Hậu điều kiện:**
        1. Trạng thái của `StudentHousingAssignment` được chuyển thành `CANCELLED`.
        2. Trạng thái của `Bed` tương ứng được chuyển về `AVAILABLE`.
- **[FR-ROOM-013] Kết thúc Cư trú (Check-out):**
    - **Mô tả:** Hệ thống **Phải** cung cấp chức năng cho Admin để ghi nhận một sinh viên đã trả phòng.
    - **Tiền điều kiện:** `StudentHousingAssignment` đang ở trạng thái `ACTIVE`.
    - **Hậu điều kiện:**
        1. Trạng thái của `StudentHousingAssignment` được chuyển thành `TERMINATED`.
        2. Trạng thái của `Bed` tương ứng được chuyển về `AVAILABLE`.

### Nhóm [FR-ROOM-QUERY]: Truy vấn & Thống kê
- **[FR-ROOM-020] Thống kê Tình trạng Phòng:**
    - **Mô tả:** Hệ thống **Phải** cung cấp API để lấy dữ liệu thống kê về tình trạng lấp đầy của các tòa nhà, tầng, phòng (tổng số giường, số giường đang ở, số giường trống).
    - **Tiền điều kiện:** Không có.
    - **Hậu điều kiện:** Dữ liệu thống kê được trả về.
- **[FR-ROOM-021] Tìm kiếm Phòng trống:**
    - **Mô tả:** Hệ thống **Phải** cung cấp API cho phép tìm kiếm các phòng còn giường trống dựa trên các tiêu chí (ví dụ: tòa nhà, giới tính).
    - **Tiền điều kiện:** Không có.
    - **Hậu điều kiện:** Danh sách các phòng phù hợp được trả về.
