# 🚨 HƯỚNG DẪN KHẮC PHỤC LỖI ACCESS DENIED TRÊN STUDENT PORTAL

## 1. Nguyên nhân gây lỗi `Access Denied` (403)
Khi Sinh viên (Role `STUDENT`) đăng nhập và truy cập vào các trang "Thanh toán", "Lịch sử thanh toán", hoặc "Lịch sử ra vào", màn hình bị lỗi hoặc trắng bốc. Backend ghi nhận lỗi `Access Denied`.

**Lý do:** Frontend đang gọi nhầm các API dành riêng cho `ADMIN/STAFF` thay vì gọi API dành cho `STUDENT` (có hậu tố `/me`).

---

## 2. Các API cần sửa đổi bên Frontend (Gọi `axiosClient`)

### ❌ Lỗi 1: Chức năng Thanh Toán & Hóa đơn (Bills)
- **Sai lầm hiện tại:** Gọi `GET /api/v1/bills` (API này chỉ cho Admin để xem toàn bộ hóa đơn của cả KTX).
- **Cách sửa cho Student:** 
  Team Backend vừa code thêm một API mới dành riêng cho sinh viên để lấy lịch sử hóa đơn của chính họ.
  - **Endpoint mới:** `GET /api/v1/bills/me`
  - **Mô tả:** Trả về toàn bộ danh sách hóa đơn gắn với sinh viên đang đăng nhập.
  - **Cập nhật vào `paymentApi.ts`:**
    ```typescript
    getMyBills: async (): Promise<any> => {
      return await axiosClient.get('/v1/bills/me');
    }
    ```

### ❌ Lỗi 2: Chức năng Lịch sử ra vào (Smart Access History)
- **Sai lầm hiện tại:** Gọi `GET /api/v1/access/history` (API này chỉ cho Admin để xem toàn bộ lịch sử quét khuôn mặt của KTX).
- **Cách sửa cho Student:**
  - **Endpoint đúng:** `GET /api/v1/access/history/me`
  - **Cập nhật vào `smartAccessApi.ts`:**
    ```typescript
    getMyAccessHistory: async (params: { page: number; size: number }): Promise<any> => {
      return await axiosClient.get('/v1/access/history/me', { params });
    }
    ```

### ❌ Lỗi 3: Chức năng Hồ sơ khuôn mặt (Face Profile)
- **Sai lầm hiện tại:** Gọi API lấy toàn bộ danh sách (Admin).
- **Cách sửa cho Student:**
  - **Endpoint đúng:** `GET /api/v1/face/profile/me` (Lấy hồ sơ khuôn mặt của bản thân).
  - **Endpoint đúng:** `GET /api/v1/face/attempts/me` (Lấy lịch sử quét mặt lỗi của bản thân).

---

## 3. Action Item cho Agent bên Frontend
1. Tìm tất cả các file trong `src/pages/student` hoặc các file Component liên quan đến Sinh viên (như Dashboard sinh viên, Lịch sử ra vào).
2. Tìm kiếm chỗ nào đang gọi hàm lấy danh sách dạng tổng (ví dụ `getAllBills`, `getAccessHistory`).
3. Đổi tất cả sang gọi các hàm có hậu tố `.../me` (ví dụ `getMyBills`, `getMyAccessHistory`).
4. Xử lý logic hiển thị nếu data trả về rỗng (hiện thông báo "Bạn chưa có hóa đơn nào" thay vì trắng màn hình).
