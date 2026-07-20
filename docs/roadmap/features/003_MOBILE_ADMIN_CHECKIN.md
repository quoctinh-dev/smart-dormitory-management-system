# MOBILE ADMIN APP - TÍNH NANG XÁC NH?N NH?N PHÒNG (CHECK-IN)

## 1. T?m nhìn (Vision)
Tính nang này dành riêng cho ?ng d?ng di d?ng c?a Ban qu?n lý/B?o v? KTX (Admin Mobile App). Thay vì ph?i ng?i tru?c máy tính gõ tên t?ng sinh viên, Admin ch? c?n dùng di?n tho?i quét mã v?ch trên th? CCCD ho?c th? Sinh viên d? truy xu?t t?c th?i thông tin nh?n phòng (Tòa, T?ng, Phòng, Giu?ng). Sau dó xác nh?n bàn giao chìa khóa ch? v?i 1 cú ch?m (1-tap).

## 2. Lu?ng nghi?p v? (Business Flow)
1. **Bu?c 1 (Scanner):** Admin m? App, ch?n tính nang "Quét Check-in".
2. **Bu?c 2 (Search):** Camera quét mã QR trên CCCD g?n chip. App s? t? d?ng bóc tách (split) chu?i QR d? l?y chính xác 12 s? CCCD c?a sinh viên.
3. **Bu?c 3 (Validation):** App g?i API GET Backend truy?n 12 s? CCCD lên d? truy v?n xem ngu?i này có h?p l? không.
4. **Bu?c 4 (Review):** Hi?n th? màn hình Bottom Sheet ch?a ?nh chân dung th?c t?, thông tin cá nhân và chi ti?t V? trí giu?ng.
5. **Bu?c 5 (Confirm):** Admin b?m "Xác nh?n & Bàn giao chìa khóa". App g?i API POST d? Check-in.

---

## 3. TRIGGER PROMPT (G?I CHO AGENT L?P TRÌNH MOBILE)

B?n hãy copy toàn b? do?n Prompt du?i dây và g?i cho Agent/AI dang d?m nh?n vi?c code d? án Mobile App:

```markdown
# TASK: XÂY D?NG TÍNH NANG "ADMIN CHECK-IN SCANNER" (QUÉT MÃ QR CCCD)
Chào b?n, h? th?ng Backend SDMS dã s?n sàng. B?n hãy code tính nang Check-in cho Mobile App dành cho Qu?n lý KTX theo yêu c?u sau:

## 1. UI/UX Yêu c?u:
- Màn hình `AdminCheckInScreen` chia làm 2 ph?n: Khung trên là Camera View quét mã QR liên t?c. Khung du?i là ô TextField nh?p tay d? phòng kèm nút "Tìm ki?m".
- Khi quét thành công ho?c b?m Tìm ki?m, hi?n th? **Bottom Sheet** (Vu?t t? du?i lên) ch?a k?t qu?.

## 2. X? lý Logic Quét mã QR CCCD Vi?t Nam:
Mã QR trên CCCD g?n chip Vi?t Nam khi quét ra s? có d?nh d?ng thô phân cách b?ng d?u `|`. Ví d?:
`07920100xxxx|021234567|NGUY?N VAN A|15052001|Nam|123 Lê L?i...`

Nhi?m v? c?a b?n:
- Vi?t hàm `parseCccdQr(String qrData)`: Tách chu?i b?ng `qrData.split('|')`. L?y ph?n t? d?u tiên (index 0) làm s? `cccd`.
- Ð?m b?o regex ho?c d? dài chu?i c?t ra dúng 12 ký t? s?.

## 3. Ð?c t? API c?n g?i (G?n token `Authorization: Bearer <Admin_Token>`):

### API 1: Tra c?u thông tin
- **Method:** `GET /api/v1/admin/check-in/search?cccd={cccd}`
- **Response m?u:**
  {
    "code": 200,
    "message": "Tìm th?y thông tin",
    "data": {
      "assignmentId": "uuid-cua-viec-xep-phong",
      "studentName": "Nguy?n Van A",
      "studentCode": "20110xxx",
      "gender": "MALE",
      "portraitUrl": "https://...",
      "buildingName": "Tòa A",
      "floorName": "T?ng 1",
      "roomName": "A101",
      "bedName": "Giu?ng 1 - T?ng 1"
    }
  }
- **X? lý:** Hi?n th? Bottom Sheet ch?a data. N?I B?T NH?T LÀ `portraitUrl` (?nh ch?p chân dung sinh viên d? b?o v? d?i chi?u khuôn m?t) và THÔNG TIN GIU?NG (Ð? b?o v? l?y dúng chìa khóa).

### API 2: Xác nh?n Check-in
- **Method:** `POST /api/v1/admin/check-in/{assignmentId}`
- **X? lý:** Khi Admin nh?n nút "Xác nh?n & Bàn giao chìa khóa" trên Bottom Sheet, g?i API này. Thành công thì hi?n th? Dialog Success "Nh?n phòng thành công" và reset l?i Camera.
```
