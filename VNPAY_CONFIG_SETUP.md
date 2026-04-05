# 🎯 Cấu hình VNPay - 3 Tham số Cơ bản

## 📋 3 Thông tin cấu hình từ VNPay

### 1️⃣ **vnp_TmnCode** - Mã Website / Terminal ID
```
Giá trị: MO2E237W
Vị trí trong hệ thống: .env → VNPAY_TMN_CODE
Công dụng: Định danh duy nhất cho merchant
```

### 2️⃣ **vnp_HashSecret** - Chuỗi bí mật tạo Checksum
```
Giá trị: AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
Vị trí trong hệ thống: .env → VNPAY_HASH_SECRET
Công dụng: Tạo chữ ký bảo mật cho request
```

### 3️⃣ **vnp_Url** - URL thanh toán môi trường TEST
```
Giá trị: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
Vị trí trong hệ thống: .env → VNPAY_URL
Công dụng: Endpoint gateway thanh toán VNPay
```

---

## 📁 File đã essere cấu hình

### 1️⃣ **`.env`** - Environment variables (Đã cập nhật ✅)
```env
# VNPay Sandbox Configuration
VNPAY_TMN_CODE=MO2E237W
VNPAY_HASH_SECRET=AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### 2️⃣ **`src/routes/payment.js`** - Code khởi tạo (Đã cập nhật ✅)
```javascript
const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,           // MO2E237W
  hashSecret: process.env.VNPAY_HASH_SECRET,     // AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
  vnpayHost: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  testMode: process.env.NODE_ENV !== "production",
});
```

### 3️⃣ **`.env.example`** - Template (Đã cập nhật ✅)
```env
VNPAY_TMN_CODE=MO2E237W
VNPAY_HASH_SECRET=AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

---

## 🔄 Luồng hoạt động

```
1. User nhấp "Thanh toán"
   ↓
2. Frontend: POST /api/payment/create-order
   ↓
3. Backend load từ .env:
   - VNPAY_TMN_CODE = MO2E237W
   - VNPAY_HASH_SECRET = AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
   - VNPAY_URL = https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   ↓
4. VNPay library:
   - Build payment URL
   - Tạo checksum bằng VNPAY_HASH_SECRET
   - Thêm VNPAY_TMN_CODE vào request
   ↓
5. Redirect sang VNPAY_URL (VNPay gateway)
   ↓
6. User thanh toán
   ↓
7. VNPay callback → Update trạng thái
   ↓
8. Redirect về /payment-success hoặc /payment-failed
```

---

## ✅ Kiểm tra cấu hình

### Bước 1: Mở Terminal
```bash
cd c:\seminar\api-server
```

### Bước 2: Kiểm tra .env file
```bash
cat .env | grep VNPAY
```

**Kết quả mong đợi:**
```
VNPAY_TMN_CODE=MO2E237W
VNPAY_HASH_SECRET=AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### Bước 3: Chạy server
```bash
npm run dev
```

**Log mong đợi:**
```
✅ MongoDB connected: localhost
🚀 Server running at http://localhost:3000
```

---

## 🧪 Test Payment Flow

### Bước 1: Register Vendor
```
→ http://localhost:5173/login
→ Click "Đăng ký chủ quán"
→ Nhập thông tin
→ Click "Đăng ký"
```

### Bước 2: Payment Page
```
→ Tự động redirect: http://localhost:5173/payment
→ Nhập số tiền (VD: 99000)
→ Click "Thanh toán với VNPay QR"
```

### Bước 3: VNPay Gateway
```
→ Redirect tới: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...
→ Hệ thống dùng: VNPAY_TMN_CODE + VNPAY_HASH_SECRET
→ User quét QR hoặc nhập card
```

### Bước 4: Test Card
**Card thành công:**
```
Number: 4111111111111111
Expiry: 12/30
CVV: 123
```

### Bước 5: Result
```
✅ Success → /payment-success
❌ Failed → /payment-failed
```

---

## 🔐 Bảo mật - DO & DON'T

### ✅ DO (Nên làm)
- [x] Lưu credentials trong `.env` file
- [x] Dùng environment variables
- [x] Không commit `.env` vào git
- [x] Rotate keys định kỳ
- [x] Dùng production keys khi deploy

### ❌ DON'T (Không nên)
- [ ] Hardcode credentials trong code
- [ ] Commit `.env` có credentials
- [ ] Share credentials qua chat/email
- [ ] Dùng test keys cho production
- [ ] Để credentials nhìn thấy ở UI

---

## 📊 Tham số so sánh

| Tham số | VNPay | .env | Code |
|--------|-------|------|------|
| Mã Website | vnp_TmnCode | VNPAY_TMN_CODE | tmnCode |
| Secret Key | vnp_HashSecret | VNPAY_HASH_SECRET | hashSecret |
| URL Gateway | vnp_Url | VNPAY_URL | vnpayHost |

---

## 🚀 Production Configuration

Khi deploy lên production, cần đổi:

```env
# TEST (Hiện tại)
VNPAY_TMN_CODE=MO2E237W
VNPAY_HASH_SECRET=AK7TH8LDRGUSPCH6VUOK2SQ76K5D37OH
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
NODE_ENV=development

# PRODUCTION (Sau này)
VNPAY_TMN_CODE=<production-code>
VNPAY_HASH_SECRET=<production-secret>
VNPAY_URL=https://api.vnpayment.vn/paymentv2/vpcpay.html
NODE_ENV=production
```

---

## 🔗 Liên kết hữu ích

- VNPay Sandbox: https://sandbox.vnpayment.vn/
- VNPay Docs: https://docs.vnpayment.vn/
- npm vnpay: https://www.npmjs.com/package/vnpay

---

## ✨ Tóm tắt

**3 bước để cấu hình VNPay:**

1. **Lấy credentials từ VNPay** ✓ (Đã có)
2. **Thêm vào `.env`** ✓ (Đã làm)
3. **Code tự động load** ✓ (Đã setup)

**Sẵn sàng test!** 🎯

Chạy: `npm run dev` → Truy cập: `http://localhost:5173` → Đăng ký Vendor → Thanh toán
