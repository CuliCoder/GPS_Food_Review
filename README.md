# Smart Food Tour

Smart Food Tour là ứng dụng du lịch ẩm thực đa ngôn ngữ gồm frontend React/Vite và backend Express/MongoDB. Ứng dụng cho phép khách du lịch chọn ngôn ngữ, khám phá điểm ăn uống trên bản đồ, nghe thuyết minh audio, chat AI gợi ý địa điểm, đánh giá quán và thanh toán VNPay cho luồng đăng ký quán của vendor.

## Tổng quan kiến trúc

- Frontend: React 18, Vite, Tailwind CSS, Zustand, React Query, Wouter, Leaflet, Framer Motion.
- Backend: Express 5, MongoDB/Mongoose, Redis tùy chọn, OpenRouter chatbot, gTTS audio, VNPay payment.
- Dữ liệu cốt lõi: POI/quán, user, payment, audio stat.

## Cấu trúc thư mục

```text
smart-food-tour/
	src/
		App.jsx            # Router + providers
		main.jsx           # Entry point React
		index.css          # Theme + global styles
		store/             # Zustand app state
		lib/               # API client, TTS, utils
		components/        # Chat box, language switcher, UI primitives
		pages/             # Language select, map, venue detail, auth, vendor/admin dashboards, payment pages

api-server/
	src/
		app.js             # Express app bootstrap
		index.js           # Server start + DB connect
		routes/            # REST endpoints
		models/            # Mongoose schemas
		middleware/        # Auth, guest tracking
		lib/               # Redis/online guest helpers
		data/              # Seed data
```

## Tính năng chính

- Chọn ngôn ngữ giao diện và nội dung thuyết minh.
- Xem bản đồ, lọc quán gần vị trí giả lập của người dùng, mở chi tiết quán.
- Phát audio tự động theo khoảng cách, dừng khi rời khỏi vùng kích hoạt.
- Chat AI gợi ý quán theo nhu cầu như gần nhất, chay, rẻ, đang mở.
- Khách lẻ có thể yêu thích, quét QR, gửi review với guest token.
- Vendor đăng nhập, nộp quán mới, thanh toán VNPay cho phí đăng ký, quản lý POI.
- Admin duyệt/từ chối POI, quản lý user, xem thống kê toàn hệ thống.

## Chạy dự án

### Backend

```bash
cd api-server
npm install
```

Tạo file `.env` và cấu hình tối thiểu:

```bash
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...
VNPAY_URL=https://sandbox.vnpayment.vn
OPENROUTER_API_KEY=...
```

Chạy server:

```bash
npm run dev
```

Seed dữ liệu mẫu:

```bash
npm run seed
```

### Frontend

```bash
cd smart-food-tour
npm install
npm run dev
```

Build production:

```bash
npm run build
```

## Tài khoản mẫu

- Admin: `admin@smartfoodtour.vn` / `Admin@123`
- Vendor: `phohanoi@gmail.com` / `Vendor@123`
- Member: `user@example.com` / `User@123`

## Luồng vận hành ngắn gọn

1. Người dùng vào trang chọn ngôn ngữ.
2. Vào bản đồ, chọn địa điểm hoặc mở chi tiết quán.
3. Khi ở gần quán, audio thuyết minh được phát từ backend gTTS.
4. Người dùng có thể chat AI, xem menu, đánh giá, quét QR.
5. Vendor đăng nhập, tạo quán mới, thanh toán VNPay, chờ admin duyệt.
6. Admin duyệt quán để POI xuất hiện cho khách du lịch.

## Tài liệu đi kèm

- [PRD.md](PRD.md)
- [CODE_MAP_AND_FLOW.md](CODE_MAP_AND_FLOW.md)

## Ghi chú kỹ thuật

- FE dùng `src/lib/api.js` làm API client chính.
- FE tự lưu auth vào `localStorage` để phục vụ dashboard, nhưng state chính vẫn nằm trong Zustand.
- Backend yêu cầu `Authorization: Bearer <token>` cho các route vendor/admin và payment.
- Audio, chatbot, và thanh toán đều là các nhánh độc lập, nên lỗi ở một nhánh không làm sập toàn hệ thống.