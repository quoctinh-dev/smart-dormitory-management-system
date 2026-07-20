# 💳 PAYMENT MODULE - TÀI LIỆU API DÀNH CHO MOBILE APP

> **Phiên bản:** 1.0 | **Cập nhật:** 2026-07-20 | **Tác giả:** AI Agent (SDMS)
> **Phạm vi:** Áp dụng cho `sdms-mobile-app` (Flutter / React Native)
> **Nguồn chân lý (Code):** `sdms-backend/modules/payment/`

---

## 📋 MỤC LỤC

1. [Tổng quan luồng thanh toán](#1-tổng-quan-luồng-thanh-toán)
2. [Enums & Constants](#2-enums--constants)
3. [API: Lấy hóa đơn](#3-api-lấy-hóa-đơn)
4. [API: Lấy hướng dẫn thanh toán + Static QR](#4-api-lấy-hướng-dẫn-thanh-toán--static-qr)
5. [API: Tạo Smart QR (thanh toán online)](#5-api-tạo-smart-qr-thanh-toán-online)
6. [Luồng xác nhận tự động qua SePay Webhook](#6-luồng-xác-nhận-tự-động-qua-sepay-webhook)
7. [API: Lịch sử hóa đơn (Student)](#7-api-lịch-sử-hóa-đơn-student)
8. [Xử lý các trường hợp đặc biệt](#8-xử-lý-các-trường-hợp-đặc-biệt)
9. [Checklist triển khai cho App](#9-checklist-triển-khai-cho-app)

---

## 1. Tổng quan luồng thanh toán

Hệ thống SDMS hỗ trợ **2 phương thức thanh toán** chính:

| Phương thức | Actor | Mô tả |
|---|---|---|
| `BANK_TRANSFER` | Student (tự thực hiện) | Chuyển khoản ngân hàng + quét QR. SePay tự động xác nhận. |
| `CASH` | Admin (xác nhận thủ công) | Sinh viên nộp tiền mặt → Admin ghi nhận trong hệ thống. |

### Tổng quan flow BANK_TRANSFER (App phải thực hiện):

```
[App] Màn hình thanh toán
    ↓
[App] GET /api/v1/bills/application/{applicationId}      → Lấy thông tin hóa đơn
[App] GET /api/v1/public/payment-instructions            → Lấy thông tin NH + Static QR
    ↓ (song song, cả 2 call đồng thời)
[App] Hiển thị thông tin bill + hướng dẫn chuyển khoản
    ↓
[User] Nhấn "Tạo mã QR thông minh"
    ↓
[App] POST /api/v1/payments/online                       → Backend tạo PENDING payment + trả về Smart QR URL
    ↓
[App] Hiển thị ảnh QR (load từ paymentUrl trả về)
    ↓
[User] Mở app ngân hàng → Quét QR → Chuyển khoản
    ↓
[SePay Webhook → Backend] Tự động xác nhận → Bill PAID → Sự kiện kích hoạt check-in
    ↓
[App] Polling hoặc nhận Push Notification → Hiển thị trạng thái thành công
```

### Trạng thái vòng đời của Bill:

```
UNPAID ──(thanh toán một phần)──→ PARTIALLY_PAID ──(thanh toán đủ)──→ PAID
UNPAID / PARTIALLY_PAID ──(quá hạn - scheduler backend chạy hàng ngày)──→ OVERDUE
Bill bất kỳ ──(Admin hủy)──→ CANCELLED
```

---

## 2. Enums & Constants

### BillStatus (Trạng thái hóa đơn)

| Giá trị | Mô tả | Màu gợi ý trong App |
|---|---|---|
| `UNPAID` | Chưa thanh toán | 🔴 Red / Orange |
| `PARTIALLY_PAID` | Đã thanh toán một phần | 🟡 Amber |
| `PAID` | Đã thanh toán đầy đủ | 🟢 Green |
| `OVERDUE` | Quá hạn thanh toán | 🔴 Red đậm |
| `CANCELLED` | Đã hủy | ⚫ Grey |

### BillType (Loại hóa đơn)

| Giá trị | Mô tả tiếng Việt |
|---|---|
| `APPLICATION_FEE` | Phí đăng ký hồ sơ |
| `ACCOMMODATION_FEE` | Phí ở KTX (hóa đơn chính) |
| `ELECTRIC_FEE` | Phí điện |
| `WATER_FEE` | Phí nước |
| `PENALTY_FEE` | Phí phạt / bồi thường |
| `DEPOSIT_FEE` | Tiền đặt cọc |

### PaymentMethod (Phương thức thanh toán)

| Giá trị | Mô tả |
|---|---|
| `BANK_TRANSFER` | Chuyển khoản ngân hàng (Student tự làm) |
| `CASH` | Tiền mặt (Admin ghi nhận - không dùng trong app student) |

### PaymentStatus (Trạng thái giao dịch)

| Giá trị | Mô tả |
|---|---|
| `PENDING` | Đang chờ xác nhận từ ngân hàng (trạng thái ban đầu khi tạo QR) |
| `SUCCESS` | Thành công (SePay đã xác nhận) |
| `FAILED` | Thất bại (số tiền không đủ hoặc lỗi) |
| `EXPIRED` | Hết hạn sau 24h không có giao dịch |
| `REFUNDED` | Đã hoàn tiền |

---

## 3. API: Lấy hóa đơn

### 3.1 Lấy hóa đơn theo Application ID

> **Dùng khi:** Sinh viên vào màn hình thanh toán (sau khi được phân phòng).  
> **Auth:** Không bắt buộc token (endpoint cho phép `ADMIN`, `STAFF`, `STUDENT`).

```
GET /api/v1/bills/application/{applicationId}
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `applicationId` | `UUID` (string) | ID hồ sơ đăng ký KTX |

**Response thành công (200):**

```json
{
  "status": 200,
  "message": "Lấy thông tin hóa đơn thành công",
  "data": {
    "billId": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
    "billType": "ACCOMMODATION_FEE",
    "amount": 3600000,
    "paidAmount": 0,
    "remainingAmount": 3600000,
    "status": "UNPAID",
    "dueDate": "2026-07-23",
    "description": "Accommodation fee",
    "assignmentId": "8fa85f64-5717-4562-b3fc-2c963f66af10",
    "roomCode": "A101",
    "bedCode": "A101-01"
  }
}
```

**Response lỗi:**

| HTTP Code | Trường hợp |
|---|---|
| `404` | Hồ sơ không tồn tại hoặc chưa có hóa đơn |
| `403` | Token không hợp lệ |

**Lưu ý App:**

- Sau khi fetch thành công, kiểm tra `status`:
  - `PAID` → Hiển thị badge "Đã thanh toán", **ẩn nút tạo QR**.
  - `OVERDUE` → Hiển thị cảnh báo đỏ, nhắc liên hệ admin.
  - `CANCELLED` → Hiển thị thông báo hóa đơn đã bị hủy.
  - `UNPAID` / `PARTIALLY_PAID` → Hiển thị nút thanh toán.
- Dùng `remainingAmount` (không phải `amount`) khi gọi API tạo Smart QR.

---

### 3.2 Lấy danh sách hóa đơn của chính mình (phân trang)

> **Dùng khi:** Màn hình "Lịch sử hóa đơn".  
> **Auth:** Bắt buộc – JWT token với `STUDENT` role.

```
GET /api/v1/bills/me/paged?page=0&size=10&sort=dueDate,desc
Authorization: Bearer {token}
```

**Query Parameters (Spring Pageable):**

| Tham số | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `page` | `int` | `0` | Trang (0-indexed) |
| `size` | `int` | `10` | Số item mỗi trang |
| `sort` | `string` | — | Ví dụ: `dueDate,desc` |

**Response thành công (200):**

```json
{
  "status": 200,
  "message": "Lấy lịch sử hóa đơn thành công",
  "data": {
    "content": [
      {
        "billId": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
        "billType": "ACCOMMODATION_FEE",
        "amount": 3600000,
        "paidAmount": 3600000,
        "remainingAmount": 0,
        "status": "PAID",
        "dueDate": "2026-07-23",
        "description": "Accommodation fee",
        "roomCode": "A101",
        "bedCode": "A101-01"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

---

## 4. API: Lấy hướng dẫn thanh toán + Static QR

> **Mục đích:** Hiển thị thông tin tài khoản ngân hàng của trường + Static QR cấu hình sẵn (không chứa số tiền cụ thể).  
> **Auth:** **Không cần** (public endpoint, không cần token).

```
GET /api/v1/public/payment-instructions
```

**Response thành công (200):**

```json
{
  "status": 200,
  "message": "Thành công",
  "data": {
    "bankName": "MBBank",
    "accountNumber": "0819281512",
    "accountHolder": "TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN",
    "qrCodeUrl": "https://img.vietqr.io/image/MB-...",
    "contentPrefix": "SDMS"
  }
}
```

**Mô tả các field:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `bankName` | `string` | Tên ngân hàng thụ hưởng |
| `accountNumber` | `string` | Số tài khoản ngân hàng |
| `accountHolder` | `string` | Tên chủ tài khoản |
| `qrCodeUrl` | `string?` | URL ảnh Static QR - chỉ có STK, không có số tiền. Dùng để hiển thị "quét cố định". |
| `contentPrefix` | `string?` | Tiền tố nội dung để SePay nhận diện. Luôn là `"SDMS"`. |

**Hiển thị trong App (ví dụ layout):**

```
┌─────────────────────────────────────────┐
│  📌 Hướng dẫn chuyển khoản ngân hàng   │
├─────────────────────────────────────────┤
│  Ngân hàng:    MBBank                  │
│  Số TK:        0819281512     [📋]      │
│  Chủ TK:       TRƯỜNG ĐH CÔNG NGHỆ SÀI GÒN │
│  Nội dung mẫu: Họ tên, MSSV, HK X ...  │
├─────────────────────────────────────────┤
│  ⚠️  Cú pháp bắt buộc để xác nhận tự động:  │
│     [Mã giao dịch - xem tạo Smart QR]  │
├─────────────────────────────────────────┤
│         [Ảnh QR tĩnh của nhà trường]   │
└─────────────────────────────────────────┘
```

---

## 5. API: Tạo Smart QR (thanh toán online)

> **Mục đích:** Sinh mã QR thông minh, tự động điền **số tiền + mã giao dịch** để SePay xác nhận tự động khi sinh viên chuyển khoản.  
> **Auth:** Không bắt buộc (cho phép sinh viên mới đăng ký chưa có tài khoản hệ thống).

```
POST /api/v1/payments/online
Content-Type: application/json
```

**Request Body:**

```json
{
  "billId": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
  "amount": 3600000,
  "paymentMethod": "BANK_TRANSFER",
  "transactionCode": null
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `billId` | `string (UUID)` | ✅ | ID hóa đơn cần thanh toán |
| `amount` | `number (BigDecimal)` | ✅ | Số tiền. Dùng `bill.remainingAmount` |
| `paymentMethod` | `string` | ✅ | **Luôn là `"BANK_TRANSFER"`**. `CASH` sẽ bị báo lỗi. |
| `transactionCode` | `string?` | ❌ | Truyền `null`, backend tự sinh mã `SDMS...` |

**Response thành công (200):**

```json
{
  "status": 200,
  "message": "Thanh toán online thành công",
  "data": {
    "paymentId": "a1b2c3d4-e5f6-...",
    "billId": "3f2504e0-4f89-...",
    "transactionCode": "SDMS1A2B3C4D5E",
    "amount": 3600000,
    "paymentMethod": "BANK_TRANSFER",
    "paymentStatus": "PENDING",
    "billStatus": null,
    "assignmentStatus": null,
    "paidAmount": null,
    "paidAt": null,
    "message": "Thanh toán thất bại",
    "paymentUrl": "https://qr.sepay.vn/img?acc=0819281512&bank=MBBank&amount=3600000&des=SDMS1A2B3C4D5E"
  }
}
```

> ⚠️ **Lưu ý quan trọng:**
> - `paymentStatus = "PENDING"` là **hoàn toàn bình thường** và mong đợi. SePay chưa xác nhận.
> - `message = "Thanh toán thất bại"` là hiển thị sai (bug nhỏ trong backend) - hãy **bỏ qua field `message`** và dựa vào `paymentUrl` để xác nhận thành công.
> - Nếu `paymentUrl != null` → **Thành công**, hiển thị QR.

**Cấu trúc `paymentUrl` (Smart QR URL từ SePay):**

```
https://qr.sepay.vn/img?acc={accountNumber}&bank={bankCode}&amount={amount}&des={transactionCode}

Ví dụ thực tế:
https://qr.sepay.vn/img?acc=0819281512&bank=MBBank&amount=3600000&des=SDMS1A2B3C4D5E
```

| Query Param | Mô tả |
|---|---|
| `acc` | Số tài khoản đích (0819281512) |
| `bank` | Mã ngân hàng theo SePay (MBBank, VCB, TCB...) |
| `amount` | Số tiền VND, không có dấu phẩy |
| `des` | Nội dung GD = Transaction Code (bắt đầu bằng `SDMS`, ví dụ: `SDMS1A2B3C4D5E`) |

**Cách load và hiển thị QR trong App:**

```dart
// Flutter: Load ảnh QR từ URL (paymentUrl là URL ảnh PNG trực tiếp)
Image.network(
  paymentUrl,  // URL trực tiếp - backend SePay trả về ảnh QR
  width: 240,
  height: 240,
  fit: BoxFit.contain,
  loadingBuilder: (context, child, progress) {
    if (progress == null) return child;
    return const Center(child: CircularProgressIndicator());
  },
  errorBuilder: (context, error, stack) {
    return const Icon(Icons.error_outline, size: 48);
  },
)
```

**Parse paymentUrl để hiển thị thông tin sao chép thủ công:**

```dart
// Dart: Parse URL để lấy từng field
final uri = Uri.parse(paymentUrl);
final bank    = uri.queryParameters['bank'] ?? '';
final acc     = uri.queryParameters['acc'] ?? '';
final amount  = uri.queryParameters['amount'] ?? '';
final content = uri.queryParameters['des'] ?? '';
```

**Layout thông tin sao chép (giống web):**

```
┌──────────────────────────────────────┐
│  🏦 Ngân hàng thụ hưởng             │
│     MBBank                           │
├──────────────────────────────────────┤
│  🏛️ Đơn vị tiếp nhận               │
│     TRƯỜNG ĐH CÔNG NGHỆ SÀI GÒN    │
├──────────────────────────────────────┤
│  💳 Số tài khoản đích               │
│     0819281512           [📋 Copy]   │
├──────────────────────────────────────┤
│  💰 Số tiền thanh toán              │
│     3,600,000 VNĐ        [📋 Copy]   │
├─── ⚠️ QUAN TRỌNG ───────────────────┤
│  📝 Nội dung giao dịch chính xác    │
│     SDMS1A2B3C4D5E       [📋 Copy]   │
│  (Bắt buộc - không sai 1 ký tự)    │
└──────────────────────────────────────┘
```

**Response lỗi từ API:**

| HTTP | `message` từ backend | Nguyên nhân | Xử lý trong App |
|---|---|---|---|
| `400` | "Không hỗ trợ thanh toán tiền mặt tại đây" | `paymentMethod = "CASH"` | Không nên xảy ra nếu app gửi đúng |
| `400` | "Hóa đơn đã được thanh toán" | Bill đã `PAID` | Refresh bill, ẩn nút QR |
| `400` | "Số tiền thanh toán không hợp lệ" | `amount <= 0` | Kiểm tra lại amount |
| `400` | "Số tiền thanh toán vượt quá số dư còn lại" | `amount > remainingAmount` | Dùng `remainingAmount` thay `amount` |
| `400` | "Hóa đơn này thuộc về một đơn giữ chỗ đã hết hạn hoặc bị hủy" | Assignment `EXPIRED`/`CANCELLED` | Thông báo, hướng dẫn liên hệ admin |
| `404` | "Không tìm thấy hóa đơn" | `billId` sai / không tồn tại | Kiểm tra lại applicationId |

---

## 6. Luồng xác nhận tự động qua SePay Webhook

> **App KHÔNG cần gọi API này.** Đây là luồng backend tự xử lý sau khi sinh viên chuyển khoản.

```
[Sinh viên quét Smart QR và chuyển khoản trên app ngân hàng]
    ↓
[Ngân hàng (MBBank) xử lý giao dịch]
    ↓
[SePay nhận biến động số dư → POST /api/webhooks/sepay]
    ↓
[Backend kiểm tra Authorization header = Apikey {sepay-api-key}]
    ↓
[Backend parse payload, kiểm tra transferType = "in" (tiền vào)]
    ↓
[Backend extract transactionCode từ nội dung GD (tìm chuỗi bắt đầu bằng "SDMS")]
    ↓
[Backend tìm Payment record có transactionCode đó, status = PENDING]
    ↓
[Kiểm tra số tiền >= amount yêu cầu]
    ↓ OK
[Backend: Payment PENDING → SUCCESS]
[Backend: Bill UNPAID/PARTIALLY_PAID → PAID]
    ↓
[Backend phát sự kiện PaymentSuccessEvent]
    ↓
[Sự kiện kích hoạt: Xác nhận Assignment → Sinh viên có thể check-in]
[Sự kiện gửi notification cho sinh viên]
```

### App nhận kết quả thanh toán - 2 phương án:

**Phương án 1 - Polling (đơn giản, khuyến nghị cho MVP):**

```dart
// Bắt đầu polling khi hiển thị màn hình QR
late Timer _pollingTimer;

void startPaymentPolling(String applicationId) {
  _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) async {
    try {
      final bill = await billApi.getBillByApplication(applicationId);
      if (bill.status == 'PAID') {
        timer.cancel();
        navigateToPaymentSuccessScreen();
      }
    } catch (e) {
      // Bỏ qua lỗi network, tiếp tục poll
    }
  });
  
  // Dừng polling sau 15 phút (tránh tốn tài nguyên)
  Future.delayed(const Duration(minutes: 15), () => _pollingTimer.cancel());
}

@override
void dispose() {
  _pollingTimer.cancel(); // QUAN TRỌNG: Hủy timer khi thoát màn hình
  super.dispose();
}
```

**Phương án 2 - Push Notification (nâng cao, cần FCM):**

- Backend gửi FCM/APNs notification sau khi `PaymentSuccessEvent` được xử lý.
- App nhận notification → navigate đến màn hình thành công.
- Cần tích hợp Firebase Cloud Messaging vào app.

---

## 7. API: Lịch sử hóa đơn (Student)

### 7.1 Danh sách đơn giản (không phân trang)

```
GET /api/v1/bills/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": 200,
  "message": "Lấy lịch sử thanh toán thành công",
  "data": [
    {
      "billId": "...",
      "billType": "ACCOMMODATION_FEE",
      "amount": 3600000,
      "paidAmount": 3600000,
      "remainingAmount": 0,
      "status": "PAID",
      "dueDate": "2026-07-23",
      "description": "Accommodation fee",
      "roomCode": "A101",
      "bedCode": "A101-01"
    }
  ]
}
```

### 7.2 Danh sách phân trang (khuyến nghị cho App với infinite scroll)

```
GET /api/v1/bills/me/paged?page=0&size=10&sort=dueDate,desc
Authorization: Bearer {token}
```

*(Response format tương tự mục 3.2)*

---

## 8. Xử lý các trường hợp đặc biệt

### Trường hợp 1: Bill đã PAID → Không cho thanh toán lại

```
Điều kiện: bill.status == 'PAID'
UI: Hiển thị badge xanh "Đã thanh toán hoàn tất"
    Ẩn nút "Tạo mã QR thông minh"
    Có thể hiển thị paidAmount, paidAt nếu có
```

### Trường hợp 2: Bill OVERDUE → Quá hạn

```
Điều kiện: bill.status == 'OVERDUE'
UI: Hiển thị banner cảnh báo đỏ
    Nội dung: "Hóa đơn đã quá hạn thanh toán."
              "Vui lòng liên hệ admin để được hỗ trợ."
    Tùy chính sách: có thể vẫn cho tạo QR hoặc ẩn
```

### Trường hợp 3: Bill CANCELLED → Đã hủy

```
Điều kiện: bill.status == 'CANCELLED'
UI: Hiển thị "Hóa đơn này đã bị hủy"
    Ẩn toàn bộ form thanh toán và nút QR
    Hướng dẫn liên hệ admin nếu có thắc mắc
```

### Trường hợp 4: PARTIALLY_PAID → Thanh toán một phần

```
Điều kiện: bill.status == 'PARTIALLY_PAID'
UI: Hiển thị "Đã thanh toán: {paidAmount} VNĐ"
    Hiển thị "Còn lại cần trả: {remainingAmount} VNĐ" (highlight màu đỏ)
    Vẫn hiển thị nút "Tạo mã QR"
    Khi tạo QR: truyền bill.remainingAmount làm amount
```

### Trường hợp 5: Smart QR hết hạn (EXPIRED)

```
Nguyên nhân: Payment PENDING quá 24 giờ → scheduler backend chuyển sang EXPIRED
Nhận biết:  App poll thấy bill vẫn UNPAID/PARTIALLY_PAID sau thời gian dài
UI: Thông báo "Mã QR đã hết hạn. Vui lòng tạo mã mới."
    Cho phép nhấn "Tạo mã QR mới" → gọi lại POST /payments/online
    Mỗi lần tạo = 1 Payment PENDING mới (không conflict)
```

### Trường hợp 6: Không có hóa đơn (404)

```
Nguyên nhân: Hồ sơ chưa được phân phòng hoặc chưa tạo bill
UI: Hiển thị "Chưa có hóa đơn"
    Hướng dẫn: "Vui lòng chờ hệ thống phân phòng và tạo hóa đơn"
    Có nút "Làm mới" để thử lại
```

### Trường hợp 7: Application không tồn tại

```
Nguyên nhân: applicationId sai hoặc hồ sơ bị xóa
UI: Hiển thị "Không tìm thấy thông tin hồ sơ"
    Hướng dẫn về màn hình hồ sơ để kiểm tra lại
```

---

## 9. Checklist triển khai cho App

### Data Models cần tạo (Dart/Flutter)

```dart
// lib/models/bill_response.dart
class BillResponse {
  final String billId;
  final String billType;          // BillType enum string
  final double amount;
  final double paidAmount;
  final double remainingAmount;
  final String status;            // BillStatus enum string
  final String dueDate;           // "YYYY-MM-DD"
  final String? description;
  final String? assignmentId;
  final String? roomCode;
  final String? bedCode;
}

// lib/models/payment_instruction.dart
class PaymentInstruction {
  final String bankName;
  final String accountNumber;
  final String accountHolder;
  final String? qrCodeUrl;        // Static QR URL
  final String? contentPrefix;    // "SDMS"
}

// lib/models/online_payment_request.dart
class OnlinePaymentRequest {
  final String billId;
  final double amount;            // Dùng remainingAmount
  final String paymentMethod;     // Luôn là "BANK_TRANSFER"
  final String? transactionCode;  // Truyền null
}

// lib/models/payment_response.dart
class PaymentResponse {
  final String paymentId;
  final String billId;
  final String transactionCode;
  final double amount;
  final String paymentMethod;
  final String paymentStatus;     // "PENDING" là bình thường
  final String? billStatus;
  final String? paidAt;
  final String? message;          // Bỏ qua field này
  final String? paymentUrl;       // URL ảnh QR - đây là key field
}
```

### API Service cần implement

```dart
// lib/services/payment_service.dart
class PaymentService {
  // GET /api/v1/bills/application/{applicationId}
  Future<BillResponse> getBillByApplication(String applicationId);
  
  // GET /api/v1/public/payment-instructions
  Future<PaymentInstruction> getPaymentInstructions();
  
  // POST /api/v1/payments/online
  Future<PaymentResponse> createSmartQR(OnlinePaymentRequest request);
  
  // GET /api/v1/bills/me/paged?page={page}&size={size}
  Future<PageResponse<BillResponse>> getMyBillsPaged(int page, int size);
  
  // GET /api/v1/bills/me (không phân trang)
  Future<List<BillResponse>> getMyBills();
}
```

### Màn hình cần implement

| Màn hình | API sử dụng | Ghi chú |
|---|---|---|
| `PaymentScreen` | `GET /bills/application/{id}` + `GET /public/payment-instructions` | Load song song (FutureGroup hoặc Future.wait) |
| `SmartQRBottomSheet` | `POST /payments/online` | Mở khi nhấn nút |
| Polling trong QR screen | `GET /bills/application/{id}` | Poll mỗi 5s, dừng khi PAID |
| `BillHistoryScreen` | `GET /bills/me/paged` | Infinite scroll |

### Luồng UI hoàn chỉnh

```
PaymentScreen
├── [Loading] Future.wait([getBill(), getInstructions()])
│
├── [Lỗi 404 - chưa có bill]
│   └── Thông báo "Chưa có hóa đơn"
│
├── [Thành công - status = UNPAID hoặc PARTIALLY_PAID]
│   ├── Card: Thông tin sinh viên
│   ├── Card: Chi tiết hóa đơn (amount, dueDate, status badge)
│   ├── Section: Hướng dẫn chuyển khoản
│   │   ├── Bank info (bankName, accountNumber, accountHolder)
│   │   ├── Content mẫu
│   │   ├── Cú pháp bắt buộc [Copy button]
│   │   └── Static QR (qrCodeUrl)
│   └── Button: "Tạo mã QR thông minh"
│       ↓ onPressed
│       POST /payments/online
│       ↓ response.paymentUrl != null
│       SmartQRBottomSheet
│       ├── [Left] Image.network(paymentUrl) → Smart QR ảnh
│       ├── [Right] Thông tin sao chép thủ công
│       │   ├── Ngân hàng
│       │   ├── Số TK    [📋]
│       │   ├── Số tiền  [📋]
│       │   └── Nội dung [📋] ⚠️ Bắt buộc
│       └── [Polling mỗi 5s] getBillByApplication()
│           ↓ status == PAID
│           PaymentSuccessScreen
│
├── [Thành công - status = PAID]
│   └── Badge xanh "Đã thanh toán hoàn tất"
│
├── [Thành công - status = OVERDUE]
│   └── Banner đỏ "Quá hạn - Liên hệ admin"
│
└── [Thành công - status = CANCELLED]
    └── Thông báo "Hóa đơn đã bị hủy"
```

### HTTP Headers bắt buộc

```http
# Các endpoint cần authentication:
Authorization: Bearer {jwtToken}
Content-Type: application/json
Accept: application/json

# Endpoint public (không cần auth):
# GET /api/v1/public/payment-instructions
Content-Type: application/json
Accept: application/json
```

### Base URL Configuration

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:8080';  // Development
  // static const String baseUrl = 'https://api.sdms.example.com';  // Production
  
  // Lưu ý: Tất cả endpoints đều có prefix /api
  // Đường dẫn đầy đủ: {baseUrl}/api/v1/bills/application/{id}
}
```

---

## 📚 Tài liệu liên quan

- [mobile_api_integration_guide.md](./mobile_api_integration_guide.md) - Hướng dẫn tích hợp API chung
- [mobile_auth_integration_guide.md](./mobile_auth_integration_guide.md) - Xác thực & JWT cho app
- [student_app_history_flow.md](./student_app_history_flow.md) - Luồng xem lịch sử trạng thái
- [CHECKIN_API_MOBILE.md](./CHECKIN_API_MOBILE.md) - API check-in (sau khi thanh toán thành công)

---

*Tài liệu này được tổng hợp từ source code thực tế (Code is Truth). Xem thực tế tại:*
- *Backend: `sdms-backend/src/main/java/com/sdms/backend/modules/payment/`*
- *Frontend Web (tham khảo): `sdms-frontend/src/pages/public/PaymentPage.tsx`*
