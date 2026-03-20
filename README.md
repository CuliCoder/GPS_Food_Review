# 🚀 Smart Tourism Web Application

Đây là hướng dẫn chi tiết để thiết lập và khởi chạy dự án **Smart Tourism Web Application** trên môi trường local. Dự án bao gồm hai phần chính: **Backend (BE)** và **Frontend (FE)**.

## 📋 Yêu cầu tiên quyết

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
* [Node.js](https://nodejs.org/) (Phiên bản LTS)
* [npm](https://www.npmjs.com/) (Thường đi kèm với Node.js)
* [MongoDB](https://www.mongodb.com/) (Hoặc cơ sở dữ liệu tương ứng)

---

## 🛠 Hướng dẫn cài đặt

### 1. Tải mã nguồn
```bash
git clone <url-repository-cua-ban>
cd <ten-thu-muc-du-an>
```

### 2. Cấu hình và Chạy Backend (BE)

Di chuyển vào thư mục backend:
```bash
cd backend
```

**Cài đặt thư viện:**
```bash
npm install
```

**Cấu hình môi trường:**
1. Tìm file `.env.example` trong thư mục backend.
2. Tạo một file mới tên là `.env`.
3. Sao chép nội dung từ `.env.example` sang `.env` và cập nhật các thông số kết nối Database (DB) mẫu.

**Khởi tạo dữ liệu (Seed DB):**
Sau khi đã kết nối Database thành công, chạy lệnh sau để nạp dữ liệu mẫu:
```bash
npm run seed
```

**Khởi chạy Server:**
```bash
npm run start
```
*Server mặc định chạy tại: `http://localhost:5000`.*

---

### 3. Cấu hình và Chạy Frontend (FE)

Mở một terminal mới và di chuyển vào thư mục frontend:
```bash
cd frontend
```

**Cài đặt thư viện:**
```bash
npm install
```

**Khởi chạy ứng dụng:**
```bash
npm run dev
```
*Ứng dụng mặc định chạy tại: `http://localhost:5173` (Vite) hoặc `http://localhost:3000` (CRA).*

---

## 📖 Cấu trúc lệnh quan trọng

| Thư mục | Lệnh | Tác dụng |
| :--- | :--- | :--- |
| **Backend** | `npm install` | Cài đặt các dependencies cho BE |
| **Backend** | `npm run seed` | Khởi tạo dữ liệu mẫu vào database |
| **Backend** | `npm run start` | Chạy server production/development |
| **Frontend** | `npm install` | Cài đặt các dependencies cho FE |
| **Frontend** | `npm run dev` | Chạy giao diện ở chế độ development |

---

## 💡 Lưu ý
* Đảm bảo Database đã được bật trước khi chạy lệnh `npm run seed`.
* Kiểm tra kỹ các biến môi trường trong file `.env` để tránh lỗi kết nối.
* Dự án hỗ trợ đa ngôn ngữ (TTS) và Chatbot AI, vui lòng kiểm tra API key trong file `.env` nếu có.