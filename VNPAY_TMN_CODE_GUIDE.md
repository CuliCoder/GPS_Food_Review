# 📝 VNPay Configuration - vnp_TmnCode (Mã Website)

## 🔍 vnp_TmnCode là gì?

**vnp_TmnCode** (hay còn gọi là **Terminal ID** hoặc **Mã Website**) là mã định danh duy nhất mà VNPay cấp cho merchant (chủ cửa hàng) khi đăng ký hệ thống.

## 📍 Vị trí gắn vnp_TmnCode

### 1️⃣ **File: `api-server/.env`**

Thêm dòng này vào file `.env`:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code_here
VNPAY_API_KEY=your_api_key_here
VNPAY_SECRET_KEY=your_secret_key_here
VNPAY_API_URL=https://sandbox.vnpayment.vn
```

### 2️⃣ **Cấu hình trong code**

File: `api-server/src/routes/payment.js`

```javascript
const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,      // ← Ở đây
  api_url: process.env.VNPAY_API_URL,
  api_key: process.env.VNPAY_API_KEY,
  secure_secret: process.env.VNPAY_SECRET_KEY,
});
```

## 🔑 Lấy vnp_TmnCode từ VNPay Sandbox

### Bước 1: Đăng nhập VNPay Sandbox
```
Truy cập: https://sandbox.vnpayment.vn/
Đăng nhập bằng tài khoản của bạn
```

### Bước 2: Tìm Mã Website
```
Menu → System Integration → Setup Integration
```

Trong trang này bạn sẽ thấy:
- **Merchant ID** (TMN Code): `XXXXXXXX` ← Đây là vnp_TmnCode
- API Key: Mã API Key
- Secret Key: Mã bí mật
```

### Bước 3: Copy và lưu
```
Mã Website (TMN Code): XXXXXXXX
   ↓
Copy vào .env: VNPAY_TMN_CODE=XXXXXXXX
```

## 📊 Ví dụ cấu hình .env

```env
# VNPay Sandbox
VNPAY_TMN_CODE=2QVBNJ67
VNPAY_API_KEY=MO2E237W
VNPAY_SECRET_KEY=AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
VNPAY_API_URL=https://sandbox.vnpayment.vn

# Khác
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

## 🔄 Lịch sử tham số (Parameter History)

| Phiên bản | Vị trí | Loại |
|-----------|--------|------|
| **Hiện tại** | `tmnCode` (VNPay npm) | Environment variable |
| **API cũ** | `vnp_TmnCode` (HTTP param) | URL parameter |
| **Legacy** | `MerchantCode` | Direct param |

## ✅ Kiểm tra cấu hình

### 1️⃣ Mở Terminal
```bash
cd c:\seminar\api-server
```

### 2️⃣ Xem biến environment
```bash
# Windows PowerShell
$env:VNPAY_TMN_CODE

# hoặc xem từ .env
cat .env | grep VNPAY_TMN_CODE
```

### 3️⃣ Test kết nối
```bash
npm run dev
# Nếu không có error → Cấu hình đúng ✅
```

## 🚀 Cách hoạt động trong code

### Khi người dùng nhấp "Thanh toán":
```
1. Frontend gửi request: POST /api/payment/create-order
2. Backend tạo payment order
3. VNPay lib dùng tmnCode để:
   ├─ Sinh request hash
   ├─ Build payment URL
   └─ Kết nối với VNPay server
4. Return URL để redirect tới VNPay
5. User nhập OTP / xác thực
6. VNPay callback về backend
7. Cập nhật trạng thái payment
```

## ⚠️ Lỗi thường gặp

### ❌ Error: `tmnCode is required`
**Giải pháp:**
- Kiểm tra `.env` file có biến `VNPAY_TMN_CODE`
- Kiểm tra giá trị không bị trống
- Restart server: `npm run dev`

### ❌ Error: `Invalid tmnCode`
**Giải pháp:**
- Copy sai mã từ VNPay
- Kiểm tra format: không có space, ký tự lạ
- Xác nhận là sandbox code nốn production code

### ❌ Error: `Connection failed`
**Giải pháp:**
- Kiểm tra `VNPAY_API_URL` đúng
- Kiểm tra internet connection
- Xác nhận VNPay server không down

## 📱 Production vs Sandbox

### 🧪 Sandbox (Test)
```env
VNPAY_TMN_CODE=<sandbox-code>
VNPAY_API_URL=https://sandbox.vnpayment.vn
VNPAY_API_KEY=<sandbox-key>
VNPAY_SECRET_KEY=<sandbox-secret>
NODE_ENV=development
```

### 🚀 Production (Live)
```env
VNPAY_TMN_CODE=<production-code>
VNPAY_API_URL=https://api.vnpayment.vn
VNPAY_API_KEY=<production-key>
VNPAY_SECRET_KEY=<production-secret>
NODE_ENV=production
```

## 🔐 Bảo mật

✅ **DO:**
- Lưu tmnCode trong `.env` (không commit vào git)
- Dùng environment variable
- Rotate keys định kỳ

❌ **DON'T:**
- Hardcode tmnCode trong code
- Commit `.env` vào repository
- Share credentials trên chat/email
- Dùng production key cho test

## 📞 Hỗ trợ

- VNPay Docs: https://docs.vnpayment.vn/
- Sandbox: https://sandbox.vnpayment.vn/
- Email: support@vnpayment.vn

---

**Tóm tắt:** `VNPAY_TMN_CODE` = Mã Website từ VNPay → Lưu vào `.env` → Code tự động load từ `process.env.VNPAY_TMN_CODE` ✨
