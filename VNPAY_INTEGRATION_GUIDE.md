# VNPay Payment Integration Guide

## 📋 Tổng quan

Hướng dẫn triển khai **VNPay QR Code Payment** cho tính năng đăng ký quán của chủ hàng (vendor) trong hệ thống Smart Food Tour.

## 🔧 Prerequisites

- Node.js >= 14
- MongoDB
- VNPay Account (Sandbox & Production)
- npm hoặc yarn

## 📦 Installation

Gói VNPay đã được cài đặt:
```bash
npm install vnpay
```

## 🔐 VNPay Sandbox Setup

### 1. Tạo tài khoản VNPay Sandbox

1. Truy cập [VNPay Sandbox](https://sandbox.vnpayment.vn/)
2. Đăng ký tài khoản nếu chưa có
3. Vào **System Integrations** → **Setup Integration**

### 2. Lấy API Credentials

Bạn sẽ cần:
- **VNPAY_API_KEY**: Mã API Key (từ Merchant Information)
- **VNPAY_SECRET_KEY**: Mã bí mật (Security Secret Key)
- **MERCHANT_ID**: Mã nhà cung cấp

### 3. Cấu hình API URL

Để test:
```
API_URL = https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
IPN_URL = https://sandbox.vnpayment.vn/paymentv2/Vpcdps.va
QUERY_URL = https://sandbox.vnpayment.vn/paymentv2/queryvc.html
```

## 🌍 Environment Variables

Cập nhật `.env` file với các biến sau:

```env
# VNPay Configuration (Sandbox)
VNPAY_API_URL=https://sandbox.vnpayment.vn
VNPAY_API_KEY=your_api_key_from_sandbox
VNPAY_SECRET_KEY=your_secret_key_from_sandbox

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Payment Configuration
VNPAY_RETURN_URL=http://localhost:5173/payment-return
VNPAY_LOCALE=vn
VNPAY_TEST_MODE=true
VNPAY_ORDER_EXPIRES=15

# Database & JWT
MONGODB_URI=mongodb://localhost:27017/smart-food-tour
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

### Para Production:

```env
VNPAY_API_URL=https://api.vnpayment.vn
VNPAY_API_KEY=your_production_api_key
VNPAY_SECRET_KEY=your_production_secret_key
NODE_ENV=production
```

## 💳 Payment Flow

### User Registration & Payment Process

```
1. Chủ quán Đăng ký (Register)
   └─> Input: Email, Password, Shop Name, Phone
   └─> Output: Account created (status: pending, paymentStatus: unpaid)

2. Chuyển hướng đến Thanh toán
   └─> Route: /payment
   └─> Người dùng nhập số tiền

3. Tạo đơn thanh toán (Create Order)
   └─> API: POST /api/payment/create-order
   └─> Generate VNPay Payment URL (with QR)
   └─> Redirect to VNPay payment page

4. Người dùng Thanh toán
   └─> Quét QR hoặc nhập thông tin thẻ
   └─> Xác nhận với ngân hàng

5. VNPay Callback
   └─> Gửi IPN notification → /api/payment/vnpay-ipn
   └─> Cập nhật trạng thái payment trong DB
   └─> Kích hoạt vendor account (status: active, paymentStatus: paid)

6. Chuyển hướng về Frontend
   └─> Success: /payment-success (hiển thị mã giao dịch)
   └─> Failed: /payment-failed (lý do thất bại)
```

## 🔌 API Endpoints

### 1. Tạo Đơn Thanh Toán

**Endpoint:** `POST /api/payment/create-order`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 99000,
  "orderId": "VENDOR-userid-timestamp",
  "description": "Phí đăng ký quán"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/pay?...",
    "paymentId": "60d5ec49c1234567890abcde",
    "orderId": "VENDOR-60d5ec49c1234567890abcde-1625077449000"
  }
}
```

### 2. VNPay Return URL

**Endpoint:** `GET /api/payment/vnpay-return`

**Parameters:** (auto-added by VNPay)
```
vnp_Amount
vnp_ResponseCode
vnp_TransactionNo
vnp_BankCode
vnp_TxnRef
vnp_SecureHash
```

**Response:** Redirect to `/payment-success` or `/payment-failed`

### 3. VNPay IPN Callback

**Endpoint:** `POST /api/payment/vnpay-ipn`

**Purpose:** Handle payment confirmation from VNPay server

**Action:** Update payment status in database

### 4. Query Payment Status

**Endpoint:** `GET /api/payment/status/:paymentId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success|pending|failed",
    "amount": 99000,
    "orderId": "VENDOR-...",
    "transactionNo": "VNP123456789",
    "paidAt": "2024-01-15T10:30:00Z"
  }
}
```

## 🗂️ Database Models

### User Model (Updated)

```javascript
{
  email: String,
  password: String,
  name: String,
  phone: String,
  role: String,           // "vendor", "member", "admin"
  status: String,         // "active", "pending", "blocked"
  
  // Vendor Fields
  shopName: String,
  paymentStatus: String,  // "unpaid", "paid", "verified"
  paymentAmount: Number,
  paymentOrderId: String,
  paidAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model (New)

```javascript
{
  userId: ObjectId,         // Reference to User
  orderId: String,
  amount: Number,
  vnpayOrderId: String,
  description: String,
  paymentMethod: String,    // "qr", "atm", "card"
  status: String,           // "pending", "processing", "success", "failed"
  paymentUrl: String,
  transactionNo: String,
  bankCode: String,
  cardType: String,
  responseCode: String,
  message: String,
  paymentCode: String,
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Sandbox Test Cards

**Successful Payment:**
```
Card Number: 4111111111111111
CVV: 123
Expiry: 12/30
OTP: random
```

**Failed Payment (Insufficient Funds):**
```
Card Number: 4012888888881881
CVV: 123
Expiry: 12/30
```

### Test Flow

1. **Start Development Servers:**
   ```bash
   # Terminal 1: Backend
   cd api-server
   npm run dev

   # Terminal 2: Frontend
   cd smart-food-tour
   npm run dev
   ```

2. **Test Vendor Registration:**
   - Navigate to `/login`
   - Click "Đăng ký chủ quán"
   - Fill in vendor information
   - System redirects to `/payment`

3. **Test Payment:**
   - Enter amount (minimum 10,000 VND)
   - Click "Thanh toán với VNPay QR"
   - Use test card numbers above
   - Complete OTP verification

4. **Check Results:**
   - Success: Redirect to `/payment-success`
   - Failed: Redirect to `/payment-failed`
   - Database: Check Payment and User records

### Debugging

Enable verbose logging:
```javascript
// In payment.js
import { ignoreLogger, VNPayLogger } from "vnpay";

const vnpay = new VNPay({
  // ...
  logger: process.env.DEBUG ? VNPayLogger : ignoreLogger
});
```

## 📱 Frontend Integration

### Payment Page Workflow

1. **Vendor Registration** → `/login` → Register form
2. **Success** → Redirect to `/payment`
3. **Payment Form** → Display shop info + amount input
4. **Click "Thanh toán"** → Create order → Redirect to VNPay
5. **After Payment** → Redirect to `/payment-success` or `/payment-failed`

### Components & Pages

- **[payment-page.jsx](../pages/payment-page.jsx)**: Payment form
- **[payment-success.jsx](../pages/payment-success.jsx)**: Success page
- **[payment-failed.jsx](../pages/payment-failed.jsx)**: Error page

## 🔄 Account Activation Flow

```
1. Vendor registers with email/password → status: pending, paymentStatus: unpaid
2. System shows payment page
3. Vendor completes payment → paymentStatus: paid, status: active
4. Vendor can now add venues (POIs)
5. Admin can approve/reject venues
```

## ⚠️ Important Notes

1. **Security:**
   - Never expose VNPAY_SECRET_KEY in frontend code
   - Always verify VNPay signatures on backend
   - Use HTTPS in production
   - Store secure hash securely

2. **Testing:**
   - Use sandbox credentials for testing
   - Test with different payment methods
   - Test network failures and timeouts
   - Monitor IPN callbacks

3. **Monitoring:**
   - Log all payment transactions
   - Monitor failed payments
   - Set up alerts for anomalies
   - Regular backup of payment data

4. **Production Checklist:**
   - [ ] Update to production VNPay credentials
   - [ ] Set `NODE_ENV=production`
   - [ ] Update FRONTEND_URL and VNPAY_RETURN_URL
   - [ ] Enable HTTPS
   - [ ] Set up monitoring/logging
   - [ ] Test end-to-end flow
   - [ ] Set up backup payment methods
   - [ ] Train support team

## 📞 Support

- **VNPay Documentation:** https://docs.vnpayment.vn/
- **VNPay Support:** https://sandbox.vnpayment.vn/
- **npm vnpay:** https://www.npmjs.com/package/vnpay

## 📝 Troubleshooting

### Payment URL not generating
- Check VNPAY_API_KEY and VNPAY_SECRET_KEY
- Verify FRONTEND_URL is correct
- Check network connectivity

### IPN not triggering
- Verify IPN endpoint is accessible
- Check firewall/security groups
- Monitor server logs

### Payment status not updating
- Check MongoDB connection
- Verify payment response code handling
- Check timezone configurations

## 🎯 Next Steps

1. Set up production VNPay account
2. Configure payment amounts and tiers
3. Set up refund handling
4. Implement email notifications
5. Add payment history page
6. Set up reconciliation reports
