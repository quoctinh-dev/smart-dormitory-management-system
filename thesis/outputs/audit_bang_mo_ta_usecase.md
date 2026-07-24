# THÔNG TIN MÃ NGUỒN (AUDIT): BẢNG MÔ TẢ USE CASE (PHÂN CHIA 10 NHÓM)
Dữ liệu dưới đây trích xuất từ 97 chức năng thực tế của hệ thống, được chia lại làm 10 nhóm (Mỗi phân hệ gồm 1 nhóm CRUD và 1 nhóm Nghiệp vụ cốt lõi).

## MODULE 1: HỆ THỐNG & TÀI KHOẢN (UC1)
### 1.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC1-06 | Xem hồ sơ cá nhân | CRUD (R) | SV KTX |
| UC1-07 | Cập nhật hồ sơ cá nhân | CRUD (U) | SV KTX |
| UC1-08 | Tạo tài khoản nhân viên | CRUD (C) | ADMIN |
| UC1-09 | Xem danh sách tài khoản cán bộ | CRUD (R) | ADMIN |
| UC1-10 | Khóa/Mở khóa tài khoản cán bộ | CRUD (U) | ADMIN |
| UC1-11 | Xem danh sách sinh viên | CRUD (R) | ADMIN/STAFF |
| UC1-12 | Xem hồ sơ chi tiết sinh viên | CRUD (R) | ADMIN/STAFF |
| UC1-13 | Cập nhật thông tin sinh viên | CRUD (U) | ADMIN |
| UC1-15 | Thiết lập cấu hình hệ thống | CRUD (U) | ADMIN |

### 1.2 Nhóm Quy trình Nghiệp vụ
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC1-01 | Đăng nhập | Nghiệp vụ | Tất cả |
| UC1-02 | Kích hoạt tài khoản (OTP) | Nghiệp vụ | SV Trường |
| UC1-03 | Đăng xuất | Nghiệp vụ | Tất cả |
| UC1-04 | Đổi mật khẩu | Nghiệp vụ | Tất cả |
| UC1-05 | Quên & Đặt lại mật khẩu | Nghiệp vụ | Tất cả |
| UC1-14 | Gắn thẻ RFID cho sinh viên | Nghiệp vụ | ADMIN |
| UC1-16 | Xem Dashboard thống kê | Nghiệp vụ | ADMIN |
| UC1-17 | Xem hợp đồng sắp hết hạn | Nghiệp vụ | ADMIN |

## MODULE 2: CƠ SỞ VẬT CHẤT (UC2)
### 2.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC2-01 | Tạo Tòa nhà | CRUD (C) | ADMIN/STAFF |
| UC2-02 | Xem danh sách Tòa nhà | CRUD (R) | ADMIN/STAFF |
| UC2-03 | Cập nhật Tòa nhà | CRUD (U) | ADMIN/STAFF |
| UC2-04 | Đổi trạng thái Tòa nhà | CRUD (U) | ADMIN/STAFF |
| UC2-05 | Tạo Tầng | CRUD (C) | ADMIN/STAFF |
| UC2-06 | Xem danh sách Tầng | CRUD (R) | ADMIN/STAFF |
| UC2-07 | Cập nhật Tầng | CRUD (U) | ADMIN/STAFF |
| UC2-08 | Tạo Phòng | CRUD (C) | ADMIN/STAFF |
| UC2-09 | Xem danh sách Phòng | CRUD (R) | ADMIN/STAFF |
| UC2-10 | Xem chi tiết Phòng | CRUD (R) | ADMIN/STAFF |
| UC2-11 | Cập nhật Phòng | CRUD (U) | ADMIN/STAFF |
| UC2-12 | Đổi trạng thái Phòng | CRUD (U) | ADMIN/STAFF |
| UC2-13 | Tạo Giường thủ công | CRUD (C) | ADMIN/STAFF |
| UC2-15 | Đổi trạng thái Giường | CRUD (U) | ADMIN/STAFF |
| UC2-19 | Xem thông tin phòng ở hiện tại (SV) | CRUD (R) | SV KTX |
| UC2-23 | Xóa Tòa nhà (Draft) | CRUD (D) | ADMIN |
| UC2-24 | Xóa Tầng (Draft) | CRUD (D) | ADMIN |
| UC2-25 | Xóa Phòng (Draft) | CRUD (D) | ADMIN |
| UC2-26 | Xóa Giường | CRUD (D) | ADMIN |

### 2.2 Nhóm Quy trình Nghiệp vụ
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC2-14 | Tự động sinh Giường | Nghiệp vụ | ADMIN/STAFF |
| UC2-16 | Quản lý Mã PIN cửa phòng | Nghiệp vụ | ADMIN |
| UC2-17 | Sinh PIN hàng loạt | Nghiệp vụ | ADMIN |
| UC2-18 | Xem kết quả xếp phòng (SV) | Nghiệp vụ | SV/ADMIN |
| UC2-20 | Xem phòng còn trống (SV) | Nghiệp vụ | SV KTX |
| UC2-21 | Xem đếm ngược hạn xác nhận | Nghiệp vụ | SV KTX |
| UC2-22 | Báo cáo phân tích phòng (Admin) | Nghiệp vụ | ADMIN/STAFF |

## MODULE 3: DỊCH VỤ LƯU TRÚ (UC3)
### 3.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC3-01 | Xem đợt đăng ký đang mở | CRUD (R) | Công khai |
| UC3-05 | Tra cứu trạng thái hồ sơ | CRUD (R) | SV Trường |

### 3.2 Nhóm Quy trình Nghiệp vụ
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC3-02 | Kiểm tra điều kiện đăng ký | Nghiệp vụ | SV Trường |
| UC3-03 | Nộp đơn đăng ký nội trú | Nghiệp vụ | SV Trường |
| UC3-04 | Tải lên minh chứng | Nghiệp vụ | SV Trường |
| UC3-06 | Nộp lại minh chứng bị yêu cầu | Nghiệp vụ | SV Trường |
| UC3-07 | Tạo và kích hoạt đợt đăng ký | Nghiệp vụ | ADMIN |
| UC3-08 | Import danh sách SV đủ điều kiện | Nghiệp vụ | ADMIN |
| UC3-09 | Xét duyệt hồ sơ đăng ký | Nghiệp vụ | ADMIN/STAFF |
| UC3-10 | Yêu cầu bổ sung hồ sơ | Nghiệp vụ | ADMIN/STAFF |
| UC3-11 | Xác nhận thanh toán (Admin) | Nghiệp vụ | ADMIN/STAFF |
| UC3-12 | Xem & Xác nhận Check-in | Nghiệp vụ | ADMIN/STAFF |
| UC3-13 | Nộp đơn gia hạn lưu trú | Nghiệp vụ | SV KTX |
| UC3-14 | Duyệt đơn gia hạn | Nghiệp vụ | ADMIN/STAFF |
| UC3-15 | Nộp đơn xin chuyển phòng (SV) | Nghiệp vụ | SV KTX |
| UC3-16 | Duyệt đơn chuyển phòng (Admin) | Nghiệp vụ | ADMIN/STAFF |
| UC3-17 | Dời phòng khẩn cấp (bảo trì) | Nghiệp vụ | ADMIN/STAFF |
| UC3-18 | Nộp đơn trả phòng (SV) | Nghiệp vụ | SV KTX |
| UC3-19 | Duyệt đơn trả phòng (Admin) | Nghiệp vụ | ADMIN/STAFF |

## MODULE 4: TÀI CHÍNH & THANH TOÁN (UC4)
### 4.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC4-02 | Xem chỉ số điện tất cả phòng | CRUD (R) | ADMIN/STAFF |
| UC4-03 | Xóa chỉ số điện sai | CRUD (D) | ADMIN/STAFF |
| UC4-05 | Xem tất cả hóa đơn hệ thống | CRUD (R) | ADMIN/STAFF |
| UC4-06 | Xem hóa đơn theo hồ sơ | CRUD (R) | Tất cả |
| UC4-07 | Xem hóa đơn của bản thân (SV) | CRUD (R) | SV KTX |
| UC4-11 | Xem hướng dẫn thanh toán | CRUD (R) | Công khai |

### 4.2 Nhóm Quy trình Nghiệp vụ
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC4-01 | Ghi chỉ số điện định kỳ | Nghiệp vụ | ADMIN/STAFF |
| UC4-04 | Tạo hóa đơn thủ công | Nghiệp vụ | ADMIN/STAFF |
| UC4-08 | Thanh toán trực tuyến QR | Nghiệp vụ | SV KTX / SV Trường |
| UC4-09 | Xác nhận thanh toán tiền mặt | Nghiệp vụ | ADMIN/STAFF |
| UC4-10 | Nhận Webhook SePay (tự động) | Nghiệp vụ | SePay System |

## MODULE 5: AN NINH & THÔNG BÁO (UC5)
### 5.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC5-09 | Xem trạng thái Face ID (SV) | CRUD (R) | SV KTX |
| UC5-10 | Xem lịch sử xác thực của SV | CRUD (R) | SV KTX |
| UC5-13 | Quản lý Cổng/Thiết bị IoT | CRUD | ADMIN |
| UC5-14 | Xem lịch sử ra vào (Admin) | CRUD (R) | ADMIN/STAFF |
| UC5-22 | Nhận & Xem thông báo (SV/Admin) | CRUD (R) | Đã đăng nhập |

### 5.2 Nhóm Quy trình Nghiệp vụ
| ID | Chức năng | Loại | Actor |
|----|-----------|------|-------|
| UC5-01 | Xác thực thẻ RFID tại cổng | Nghiệp vụ | IoT Device |
| UC5-02 | Xác thực khuôn mặt tại cổng | Nghiệp vụ | IoT Device |
| UC5-03 | Xác thực mã PIN cửa phòng | Nghiệp vụ | IoT Device |
| UC5-04 | Lấy danh sách RFID hợp lệ | Nghiệp vụ | IoT Device |
| UC5-05 | Báo lỗi phần cứng | Nghiệp vụ | IoT Device |
| UC5-06 | Đồng bộ log offline IoT | Nghiệp vụ | IoT Device |
| UC5-07 | Đăng ký Face ID (SV) | Nghiệp vụ | SV KTX |
| UC5-08 | Yêu cầu thay ảnh Face ID (SV) | Nghiệp vụ | SV KTX |
| UC5-11 | Duyệt đăng ký Face ID | Nghiệp vụ | ADMIN/STAFF |
| UC5-12 | Thu hồi Face ID | Nghiệp vụ | ADMIN/STAFF |
| UC5-15 | Mở cửa từ xa | Nghiệp vụ | ADMIN |
| UC5-16 | Mở cửa khẩn cấp toàn hệ thống | Nghiệp vụ | ADMIN |
| UC5-17 | Cấu hình khung giờ RFID/Face | Nghiệp vụ | ADMIN |
| UC5-18 | Cấu hình chính sách giờ giới nghiêm | Nghiệp vụ | ADMIN |
| UC5-19 | Xin phép về trễ (SV) | Nghiệp vụ | SV KTX |
| UC5-20 | Duyệt đơn về trễ (Admin) | Nghiệp vụ | ADMIN |
| UC5-21 | Gửi thông báo hàng loạt | Nghiệp vụ | ADMIN |
| UC5-23 | Báo cáo sự cố cơ sở vật chất | Nghiệp vụ | SV KTX |
| UC5-24 | Đồng bộ trạng thái IoT thủ công | Nghiệp vụ | ADMIN |
