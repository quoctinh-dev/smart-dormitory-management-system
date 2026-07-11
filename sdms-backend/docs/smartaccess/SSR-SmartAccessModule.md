# SSR - Module Ra vào Thông minh (SmartAccess)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Ra vào Thông minh.

---

## 1. Tổng quan Chức năng

Module này chịu trách nhiệm xử lý logic nghiệp vụ để đưa ra quyết định cuối cùng (`GRANTED` / `DENIED`) khi có một yêu cầu ra vào từ các thiết bị IoT tại cổng.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-ACCESS-EVAL]: Đánh giá Yêu cầu Ra vào
- **[FR-ACCESS-001] Tiếp nhận Yêu cầu từ IoT:**
    - **Mô tả:** Hệ thống **Phải** có khả năng tiếp nhận các yêu cầu xác thực (chứa dữ liệu khuôn mặt hoặc mã RFID) từ các thiết bị IoT thông qua HTTP POST API.
    - **Tiền điều kiện:** Thiết bị IoT gọi đúng endpoint HTTP POST API.
    - **Hậu điều kiện:** Yêu cầu được đưa vào hàng đợi để xử lý.
- **[FR-ACCESS-002] Xác minh Danh tính:**
    - **Mô tả:** Hệ thống **Phải** xác định được `studentId` từ dữ liệu yêu cầu.
    - **Tiền điều kiện:** Yêu cầu [FR-ACCESS-001] được thực hiện.
    - **Hậu điều kiện:** Nếu xác định thành công, hệ thống có được `studentId` và tiếp tục xử lý. Nếu thất bại, hệ thống ghi log và từ chối yêu cầu.
- **[FR-ACCESS-003] Kiểm tra Tư cách Nội trú:**
    - **Mô tả:** Hệ thống **Phải** kiểm tra xem sinh viên có phải là nội trú hợp lệ hay không.
    - **Tiền điều kiện:** Đã có `studentId` từ [FR-ACCESS-002].
    - **Hậu điều kiện:** Nếu sinh viên có một `StudentHousingAssignment` đang ở trạng thái `ACTIVE`, yêu cầu được tiếp tục. Nếu không, yêu cầu bị từ chối.
- **[FR-ACCESS-004] Đánh giá Chính sách Giờ giới nghiêm:**
    - **Mô tả:** Hệ thống **Phải** kiểm tra xem thời điểm yêu cầu có vi phạm bất kỳ chính sách giờ giới nghiêm (`CurfewPolicy`) nào đang hoạt động hay không.
    - **Tiền điều kiện:** Yêu cầu đã vượt qua bước [FR-ACCESS-003].
    - **Hậu điều kiện:** Nếu không vi phạm, yêu cầu được tiếp tục. Nếu vi phạm, yêu cầu bị từ chối.
- **[FR-ACCESS-005] Ra quyết định và Gửi lệnh:**
    - **Mô tả:** Dựa trên kết quả của các bước đánh giá, hệ thống **Phải** đưa ra quyết định cuối cùng (`GRANTED` hoặc `DENIED`) và gửi kết quả bằng HTTP Response JSON về lại cho thiết bị IoT.
    - **Tiền điều kiện:** Toàn bộ chuỗi đánh giá đã hoàn tất.
    - **Hậu điều kiện:** Kết quả được gửi về thiết bị IoT.

### Nhóm [FR-ACCESS-LOG]: Ghi nhận và Quản lý
- **[FR-ACCESS-010] Ghi Lịch sử Ra vào:**
    - **Mô tả:** Hệ thống **Phải** ghi lại mọi yêu cầu ra vào (cả thành công và thất bại) vào bảng `access_history`.
    - **Tiền điều kiện:** Một yêu cầu đã được xử lý xong.
    - **Hậu điều kiện:** Một bản ghi `AccessHistory` mới được tạo, chứa thông tin về thời gian, sinh viên, cổng, phương thức, và kết quả.
- **[FR-ACCESS-011] Quản lý Chính sách Giờ giới nghiêm:**
    - **Mô tả:** Hệ thống **Phải** cung cấp giao diện cho Admin để thực hiện CRUD đối với các `CurfewPolicy`.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`.
    - **Hậu điều kiện:** Các quy tắc về giờ giới nghiêm được cập nhật trong CSDL.

### Nhóm [FR-ACCESS-OP]: Các Tác vụ Vận hành
- **[FR-ACCESS-020] Mở cửa Từ xa (Remote Unlock):**
    - **Mô tả:** Hệ thống **Phải** cung cấp chức năng cho Admin để gửi lệnh mở một cổng cụ thể từ xa.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`.
    - **Hậu điều kiện:** Lệnh `OPEN_DOOR` được gửi đến thiết bị IoT tương ứng. Lịch sử ra vào ghi nhận hành động này với phương thức `REMOTE_UNLOCK`.
- **[FR-ACCESS-021] Chế độ Khẩn cấp (Emergency Override):**
    - **Mô tả:** Hệ thống **Phải** có khả năng kích hoạt một chế độ khẩn cấp (ví dụ: báo cháy), trong đó tất cả các cổng sẽ được tự động mở và bỏ qua mọi quy tắc kiểm tra.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN` hoặc một hệ thống báo cháy tự động kích hoạt.
    - **Hậu điều kiện:** Lệnh `OPEN_DOOR` được gửi đến tất cả các thiết bị.
