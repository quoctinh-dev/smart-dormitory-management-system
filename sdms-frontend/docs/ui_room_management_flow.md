# GIAO DIỆN VÀ LUỒNG XỬ LÝ: PHÂN HỆ QUẢN LÝ PHÒNG (INTERACTIVE DASHBOARD)

## 1. Mục tiêu
Biến trang hiển thị sơ đồ phòng hiện tại thành một **Interactive Dashboard** (Bảng điều khiển tương tác) hỗ trợ đầy đủ các thao tác CRUD (Thêm/Sửa trạng thái) và Drill-down (Xem chi tiết) mà không cần chuyển trang. Đảm bảo cấu trúc code sạch (Clean Code), dễ bảo trì và tối ưu hiệu năng.

## 2. Cấu trúc Component Frontend
Để tránh việc file `RoomManagementPage.tsx` bị phình to (Fat Component), giao diện sẽ được chia nhỏ thành các component độc lập nằm trong thư mục `src/pages/admin/RoomManagement/components/`:

```text
RoomManagement/
├── RoomManagementPage.tsx       # (Container) Chứa bộ lọc, gọi API danh sách phòng, truyền props xuống dưới.
├── DashboardView.tsx            # (Layout) Vòng lặp map qua danh sách phòng và render Grid.
└── components/
    ├── RoomCard.tsx             # (UI Component) Thẻ hiển thị thông tin 1 phòng. Chứa RoomActionMenu và BedGrid.
    ├── RoomActionMenu.tsx       # (UI Component) Menu 3 chấm góc phải thẻ Phòng (Sửa phòng, Thêm giường, Khóa phòng).
    ├── BedIcon.tsx              # (UI Component) Icon cái giường. Nhận prop status để tô màu và handle onClick.
    ├── BedDetailDrawer.tsx      # (Overlay) Drawer trượt từ cạnh phải màn hình khi bấm vào 1 Bed, hiển thị chi tiết sinh viên.
    ├── CreateRoomDialog.tsx     # (Overlay) Modal thêm phòng mới.
    └── CreateBedDialog.tsx      # (Overlay) Modal thêm giường mới cho 1 phòng.
```

## 3. Luồng tương tác (UI Flow)
1. **Lọc Dữ liệu (Top Bar):** 
   - Admin chọn `Tòa nhà` -> Hệ thống mở khóa chọn `Tầng`.
   - Cạnh bộ lọc có nút `+ Thêm Phòng` (mở `CreateRoomDialog`).
2. **Hiển thị Sơ đồ (DashboardView):**
   - Render các `RoomCard`. Mỗi card hiển thị tổng quan: Số phòng, Sức chứa, Trạng thái (ACTIVE/MAINTENANCE).
   - Menu 3 chấm trên Card mở ra các thao tác: Cập nhật phòng, Thêm giường, Đổi trạng thái phòng.
3. **Thao tác Giường (Bed Drill-down):**
   - Bấm vào `BedIcon` màu XANH (AVAILABLE): Mở menu/modal hỏi có muốn chuyển sang MAINTENANCE không.
   - Bấm vào `BedIcon` màu ĐỎ (OCCUPIED): Mở `BedDetailDrawer` hiển thị hồ sơ sinh viên đang lưu trú, lịch sử thanh toán, và nút Check-out khẩn cấp.

## 4. Quản lý Trạng thái (State Management)
Sử dụng Local State (useState/useReducer) kết hợp với Custom Hook `useRoomDashboard` hiện có để quản lý đóng/mở Modal và Drawer. Tránh đưa các state UI tạm thời này vào Global Context.
