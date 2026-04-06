# 🚀 Quick Start Guide - VNPay Integration

## ⚡ 5 Bước Setup

### 1️⃣ Đăng ký VNPay Sandbox
```
🔗 https://sandbox.vnpayment.vn/
📝 Đăng ký tài khoản → Xác nhận email
🔑 Lấy VNPAY_API_KEY và VNPAY_SECRET_KEY
```

### 2️⃣ Cấu hình Environment
**File: `api-server/.env`**
```env
VNPAY_API_URL=https://sandbox.vnpayment.vn
VNPAY_API_KEY=your-api-key-here
VNPAY_SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

### 3️⃣ Install Dependencies (nếu chưa)
```bash
cd api-server
npm install vnpay
```

### 4️⃣ Chạy Development Servers

**Terminal 1 - Backend:**
```bash
cd c:\seminar\api-server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd c:\seminar\smart-food-tour
npm run dev
```

### 5️⃣ Test Payment Flow

**Step 1: Đăng ký vendor**
```
URL: http://localhost:5173/login
Click: "Đăng ký chủ quán"
Fill:
  - Email: vendor@test.com
  - Password: Test@123456
  - Tên: Nguyễn Thị Tâm
  - Tên quán: Quán Tâm
  - SĐT: 0912345678
```

**Step 2: Thanh toán**
```
Tự động chuyển đến: http://localhost:5173/payment
Input: 99000 (VND)
Click: "Thanh toán với VNPay QR"
→ Redirect tới VNPay
```

**Step 3: Xác thực thanh toán**
```
Dùng test card:
  Number: 4111111111111111
  Expiry: 12/30
  CVV: 123
  OTP: Random
```

**Step 4: Kết quả**
```
✅ Success: /payment-success → Transaction confirmed
❌ Failed: /payment-failed → Thử lại
```

---

## 🧪 Test Cards

### ✅ Successful Payment
| Field | Value |
|-------|-------|
| Card Number | 4111111111111111 |
| Expiry Date | 12/30 |
| CVV | 123 |
| OTP | (Random) |

### ❌ Failed Payment (Insufficient Funds)
| Field | Value |
|-------|-------|
| Card Number | 4012888888881881 |
| Expiry Date | 12/30 |
| CVV | 123 |

---

## 📊 Database Workflow

**After successful payment:**

```javascript
// User collection
{
  _id: "user-id",
  email: "vendor@test.com",
  role: "vendor",
  status: "active",           // Changed from "pending"
  paymentStatus: "paid",      // Changed from "unpaid"
  paymentAmount: 99000,
  paymentOrderId: "VENDOR-...",
  paidAt: "2024-01-15T10:30:00Z"
}

// Payment collection
{
  _id: "payment-id",
  userId: "user-id",
  orderId: "VENDOR-...",
  amount: 99000,
  status: "success",
  transactionNo: "VNP123456789",
  paidAt: "2024-01-15T10:30:00Z"
}
```

---

## 🔍 Debugging Checklist

❓ **Payment URL not generating?**
- ✅ Check `VNPAY_API_KEY` is correct
- ✅ Check `VNPAY_SECRET_KEY` is correct
- ✅ Check `FRONTEND_URL` is set
- ✅ Check backend server is running

❓ **IPN Callback not received?**
- ✅ Check MongoDB is running
- ✅ Check server logs for errors
- ✅ Verify payment status in Payment collection

❓ **Redirect loop in payment flow?**
- ✅ Check `VNPAY_RETURN_URL` environment variable
- ✅ Verify frontend routes are registered in `App.jsx`
- ✅ Check browser console for errors

❓ **Test card not accepted?**
- ✅ Use exact card numbers from table
- ✅ Verify expiry date format
- ✅ Check OTP if required
- ✅ Use uppercase for card fields if needed

---

## 📁 Key Files to Review

| File | Purpose |
|------|---------|
| `api-server/src/routes/payment.js` | Payment API endpoints |
| `api-server/src/models/payment.model.js` | Payment schema |
| `smart-food-tour/src/pages/payment-page.jsx` | Payment form UI |
| `smart-food-tour/src/lib/api.js` | API client functions |
| `VNPAY_INTEGRATION_GUIDE.md` | Complete documentation |

---

## ✨ Supported Payment Methods

- 💳 **Credit Card** (Visa, Mastercard, etc.)
- 🏦 **ATM Card** (VietCombank, TechcomBank, etc.)
- 📱 **QR Code** (All banks)
- 💰 **E-wallet** (Momo, ZaloPay, etc.)

---

## 🎯 Next Steps

After successful testing:

1. **Deploy to staging:**
   ```bash
   npm run build  # frontend
   npm start      # backend (prod)
   ```

2. **Switch to production:**
   - Get production VNPay credentials
   - Update `.env` with production URLs
   - Set `NODE_ENV=production`
   - Enable HTTPS
   - Configure domain/SSL

3. **Add features:**
   - Email confirmation after payment
   - Payment history page
   - Refund processing
   - Multi-currency support

---

## 📞 Support Resources

- 📖 Full Guide: `VNPAY_INTEGRATION_GUIDE.md`
- 📋 Implementation: `IMPLEMENTATION_SUMMARY.md`
- 🔗 VNPay Docs: https://docs.vnpayment.vn/
- 📦 npm vnpay: https://www.npmjs.com/package/vnpay

---

**Happy Testing! 🎉**

If you encounter any issues, check the debugging checklist above or review the full integration guide.
