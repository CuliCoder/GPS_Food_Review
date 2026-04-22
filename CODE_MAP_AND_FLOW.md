# Code Map and Flow

Tài liệu này giải thích từng khối code làm gì và dữ liệu đi qua hệ thống như thế nào. Mục tiêu là đọc xong có thể tự lần ra luồng của dự án.

## 1. Bản đồ code theo layer

### Frontend entry layer

- [smart-food-tour/src/main.jsx](smart-food-tour/src/main.jsx) khởi động React app và gắn `App` vào DOM.
- [smart-food-tour/src/App.jsx](smart-food-tour/src/App.jsx) cấu hình router, React Query provider, Tooltip provider và toaster.
- [smart-food-tour/src/index.css](smart-food-tour/src/index.css) khai báo theme, font, màu nền, marker map và style global.

### State layer

- [smart-food-tour/src/store/use-app-store.js](smart-food-tour/src/store/use-app-store.js) là Zustand store trung tâm cho language, gpsPosition, playedVenues và auth.
- Store chỉ persist `language`, còn token/user lấy từ localStorage khi khởi tạo để phục vụ dashboard.

### API layer

- [smart-food-tour/src/lib/api.js](smart-food-tour/src/lib/api.js) là API client chính.
- File này tự gắn JWT, unwrap response kiểu `{ success, data }`, và định nghĩa toàn bộ hook React Query cho venue, auth, vendor, admin và payment.
- [smart-food-tour/src/lib/tts.js](smart-food-tour/src/lib/tts.js) quản lý phát audio stream, dừng audio, unlock autoplay và fallback Web Speech API.

### UI components

- [smart-food-tour/src/components/chat-box.jsx](smart-food-tour/src/components/chat-box.jsx) là chat AI nổi trên màn hình.
- [smart-food-tour/src/components/language-switcher.jsx](smart-food-tour/src/components/language-switcher.jsx) là nút đổi ngôn ngữ về trang đầu.
- [smart-food-tour/src/components/ui/](smart-food-tour/src/components/ui/) chứa bộ component UI tái sử dụng.

### Pages

- [smart-food-tour/src/pages/language-select.jsx](smart-food-tour/src/pages/language-select.jsx) là màn chọn ngôn ngữ đầu vào.
- [smart-food-tour/src/pages/map-page.jsx](smart-food-tour/src/pages/map-page.jsx) là bản đồ trung tâm của trải nghiệm guest.
- [smart-food-tour/src/pages/venue-detail.jsx](smart-food-tour/src/pages/venue-detail.jsx) là màn chi tiết quán.
- [smart-food-tour/src/pages/auth-page.jsx](smart-food-tour/src/pages/auth-page.jsx) xử lý login và vendor registration.
- [smart-food-tour/src/pages/vendor-dashboard.jsx](smart-food-tour/src/pages/vendor-dashboard.jsx) quản lý quán, thống kê và luồng đăng ký quán mới.
- [smart-food-tour/src/pages/admin-dashboard.jsx](smart-food-tour/src/pages/admin-dashboard.jsx) duyệt POI, quản lý user và xem báo cáo.
- [smart-food-tour/src/pages/payment-page.jsx](smart-food-tour/src/pages/payment-page.jsx), [smart-food-tour/src/pages/payment-success.jsx](smart-food-tour/src/pages/payment-success.jsx), [smart-food-tour/src/pages/payment-failed.jsx](smart-food-tour/src/pages/payment-failed.jsx) bao quanh luồng thanh toán.

### Backend bootstrap

- [api-server/src/index.js](api-server/src/index.js) connect DB rồi start server.
- [api-server/src/app.js](api-server/src/app.js) cấu hình middleware và mount router dưới `/api`.
- [api-server/src/routes/index.js](api-server/src/routes/index.js) gom toàn bộ route nhỏ thành một router tổng.

### Backend domain layer

- [api-server/src/models/user.model.js](api-server/src/models/user.model.js) quản lý user, role, status và password hash.
- [api-server/src/models/poi.model.js](api-server/src/models/poi.model.js) là schema trung tâm của quán/điểm đến.
- [api-server/src/models/payment.model.js](api-server/src/models/payment.model.js) lưu lịch sử giao dịch VNPay.
- [api-server/src/models/audioStat.model.js](api-server/src/models/audioStat.model.js) lưu thống kê audio.

### Backend route layer

- [api-server/src/routes/venues.js](api-server/src/routes/venues.js) phục vụ danh sách quán, chi tiết, respect, review, QR tap.
- [api-server/src/routes/audio.js](api-server/src/routes/audio.js) tạo và stream audio từ gTTS, có cache file và lock để tránh generate trùng.
- [api-server/src/routes/chat.js](api-server/src/routes/chat.js) gọi OpenRouter và fallback sang gợi ý quán cục bộ nếu AI lỗi.
- [api-server/src/routes/auth.js](api-server/src/routes/auth.js) xử lý login, register, refresh, logout, vendor/admin stats và moderation summary.
- [api-server/src/routes/pois.js](api-server/src/routes/pois.js) xử lý tạo/sửa/xóa quán, dịch đa ngôn ngữ và approval workflow.
- [api-server/src/routes/payment.js](api-server/src/routes/payment.js) tạo VNPay order, verify return URL, IPN callback và query payment status.
- [api-server/src/routes/languages.js](api-server/src/routes/languages.js) trả 15 ngôn ngữ hỗ trợ.
- [api-server/src/routes/health.js](api-server/src/routes/health.js) dùng cho health check.

### Redis và xử lý concurrent audio

- Redis được dùng theo hướng optional ở backend để hỗ trợ lock phân tán cho audio generation.
- Cơ chế chính nằm trong [api-server/src/routes/audio.js](api-server/src/routes/audio.js).

Chiến lược khi nhiều người cùng nghe một quán tại cùng thời điểm:

1. Tạo cache key theo `venueId + lang + textHash` để xác định đúng file audio cần sinh.
2. Kiểm tra file cache nếu đã tồn tại thì stream ngay, không generate lại.
3. Nếu chưa có cache, backend thử lấy Redis lock bằng `SET key token NX PX`.
4. Tiến trình lấy được lock sẽ là tiến trình duy nhất generate MP3.
5. Các tiến trình khác chờ trong khoảng timeout và poll xem file cache đã xuất hiện chưa.
6. Khi lock rơi hoặc tiến trình chính lỗi, tiến trình chờ có thể takeover lock và generate tiếp.
7. Lock được release an toàn bằng Lua script để tránh xóa lock của tiến trình khác.

Các biến cấu hình liên quan concurrent audio:

- `AUDIO_LOCK_TTL_MS`: thời gian sống lock.
- `AUDIO_WAIT_TIMEOUT_MS`: thời gian client request chờ file cache xuất hiện.
- `AUDIO_POLL_INTERVAL_MS`: tần suất poll cache/lock khi đang chờ.

Fallback khi không có Redis:

- Backend vẫn generate theo cơ chế file cache cục bộ.
- Có kiểm tra tồn tại file trước/sau generate để giảm khả năng tạo trùng.
- Dù vậy, mức bảo vệ race condition sẽ thấp hơn lock phân tán Redis.

## 2. Dữ liệu chạy qua hệ thống như thế nào

### 2.1 Guest discovery flow

1. User vào [smart-food-tour/src/pages/language-select.jsx](smart-food-tour/src/pages/language-select.jsx).
2. Chọn ngôn ngữ và chuyển sang [smart-food-tour/src/pages/map-page.jsx](smart-food-tour/src/pages/map-page.jsx).
3. Map page đọc `language` và `gpsPosition` từ [smart-food-tour/src/store/use-app-store.js](smart-food-tour/src/store/use-app-store.js).
4. Map page gọi `useNearbyVenues()` trong [smart-food-tour/src/lib/api.js](smart-food-tour/src/lib/api.js).
5. Backend [api-server/src/routes/venues.js](api-server/src/routes/venues.js) lọc POI approved, tính khoảng cách, trả danh sách gần nhất.
6. Khi venue nằm trong vùng audio, map page gọi [smart-food-tour/src/lib/tts.js](smart-food-tour/src/lib/tts.js) để phát audio từ [api-server/src/routes/audio.js](api-server/src/routes/audio.js).
7. Người dùng mở [smart-food-tour/src/pages/venue-detail.jsx](smart-food-tour/src/pages/venue-detail.jsx) để xem menu, review, respect và QR.

Quy tắc khi cùng lúc lọt vào phạm vi nhiều quán:

- `venues/nearby` được backend sort theo khoảng cách tăng dần.
- Frontend lấy quán đầu tiên trong danh sách `withinAudioRadius` chưa phát để trigger audio.
- Kết quả: quán gần nhất sẽ được ưu tiên phát trước.
- Nếu đang phát một quán, audio chỉ dừng khi ra khỏi `audioRadius` hoặc track hiện tại kết thúc.

### 2.2 Review and reaction flow

1. Frontend gửi review qua `useCreateVenueReview()`.
2. `api.js` tự gắn `x-guest-token` bằng localStorage token riêng cho khách.
3. Backend trong [api-server/src/routes/venues.js](api-server/src/routes/venues.js) kiểm tra rate limit, spam pattern và duplicate review.
4. Review hợp lệ sẽ được lưu vào POI và frontend invalidate cache để hiển thị lại.

Ghi chú: luồng review này không bắt buộc đăng nhập, người dùng ẩn danh vẫn gửi bình luận được qua `x-guest-token`.

QR scan để nghe audio:

- Mỗi POI có `landingUrl` và `landingQrImageUrl`.
- User quét QR sẽ vào landing của quán đó.
- Từ landing/venue detail, user có thể kích hoạt nghe audio guide của quán tương ứng.

### 2.3 Vendor onboarding flow

1. Vendor login tại [smart-food-tour/src/pages/auth-page.jsx](smart-food-tour/src/pages/auth-page.jsx).
2. Nếu vào luồng payment, [smart-food-tour/src/pages/payment-page.jsx](smart-food-tour/src/pages/payment-page.jsx) gọi `useCreatePayment()`.
3. Backend [api-server/src/routes/payment.js](api-server/src/routes/payment.js) tạo payment record và trả VNPay URL.
4. Sau khi thanh toán, VNPay redirect về return URL để update trạng thái payment.
5. Vendor quay lại dashboard và tạo POI mới qua [smart-food-tour/src/pages/vendor-dashboard.jsx](smart-food-tour/src/pages/vendor-dashboard.jsx).
6. Backend [api-server/src/routes/pois.js](api-server/src/routes/pois.js) gắn `status: pending` và lưu bản dịch đa ngôn ngữ.
7. Admin duyệt POI để nó xuất hiện trên map công khai.

### 2.4 Admin moderation flow

1. Admin vào [smart-food-tour/src/pages/admin-dashboard.jsx](smart-food-tour/src/pages/admin-dashboard.jsx).
2. UI gọi các hook từ [smart-food-tour/src/lib/api.js](smart-food-tour/src/lib/api.js) như `useAdminStats`, `useAdminPending`, `useAdminUsers`, `useAdminVenues`.
3. Backend trả thống kê, danh sách chờ duyệt và danh sách quán.
4. Admin approve/reject, backend cập nhật status trong [api-server/src/routes/pois.js](api-server/src/routes/pois.js) hoặc [api-server/src/routes/auth.js](api-server/src/routes/auth.js) tùy ngữ cảnh.

## 3. Sơ đồ tổng thể

```mermaid
flowchart TD
  A[Guest / Vendor / Admin] --> B[Frontend React App]
  B --> C[Zustand Store]
  B --> D[React Query API Client]
  D --> E[Express API]
  E --> F[MongoDB]
  E --> G[Redis Optional]
  E --> H[OpenRouter Chat]
  E --> I[gTTS Audio]
  E --> J[VNPay]
```

## 4. Guest flow

```mermaid
flowchart LR
  L[/language-select/] --> M[/map/]
  M -->|click map| P[update gpsPosition]
  P --> Q[useNearbyVenues]
  Q --> R[/venue/:id/]
  R --> S[review / respect / qr tap]
  M --> T[ChatBox AI]
  M --> U[Auto audio playback]
```

## 5. Vendor flow

```mermaid
flowchart LR
  A[/login/] --> B[Vendor login]
  B --> C[/payment/]
  C --> D[Create VNPay order]
  D --> E[VNPay return / IPN]
  E --> F[Vendor dashboard]
  F --> G[Create / edit POI]
  G --> H[Pending approval]
  H --> I[Admin approves]
  I --> J[POI visible on map]
```

## 6. Audio flow

```mermaid
sequenceDiagram
  participant U as User
  participant M as MapPage
  participant S as Store
  participant A as API
  participant B as Backend Audio

  U->>M: Click map / move location
  M->>S: setGpsPosition
  M->>A: useNearbyVenues(lat,lng,lang)
  A->>B: GET /api/venues/nearby
  B-->>A: nearby venues
  M->>A: getAudioUrl(venueId, lang)
  A->>B: GET /api/audio/:venueId?lang=
  B-->>M: mp3 stream
  M->>U: autoplay audio guide
```

## 7. File trách nhiệm nhanh

- [smart-food-tour/src/pages/map-page.jsx](smart-food-tour/src/pages/map-page.jsx): bản đồ, sidebar, audio trigger, marker, chat entry.
- [smart-food-tour/src/pages/venue-detail.jsx](smart-food-tour/src/pages/venue-detail.jsx): hero, tabs, audio button, review, QR.
- [smart-food-tour/src/pages/vendor-dashboard.jsx](smart-food-tour/src/pages/vendor-dashboard.jsx): quản lý quán, thêm quán, thống kê vendor.
- [smart-food-tour/src/pages/admin-dashboard.jsx](smart-food-tour/src/pages/admin-dashboard.jsx): moderation, stats, users, reports.
- [api-server/src/routes/venues.js](api-server/src/routes/venues.js): mọi dữ liệu quán public và tương tác khách.
- [api-server/src/routes/pois.js](api-server/src/routes/pois.js): lifecycle của POI từ tạo tới duyệt/xóa.
- [api-server/src/routes/payment.js](api-server/src/routes/payment.js): order, return, IPN, status.
- [api-server/src/routes/audio.js](api-server/src/routes/audio.js): text-to-speech stream và cache.
- [api-server/src/routes/chat.js](api-server/src/routes/chat.js): AI assistant và fallback.

## 8. Sơ đồ tuần tự chi tiết theo chức năng

Phần này ghi rõ function/route nào thực hiện từng bước để bạn lần theo luồng nhanh hơn khi debug hoặc chỉnh logic.

Bản tách riêng để dễ đọc: [SEQUENCE_DIAGRAMS.md](SEQUENCE_DIAGRAMS.md)

### 8.1 Chọn ngôn ngữ rồi vào bản đồ

```mermaid
sequenceDiagram
  participant U as User
  participant LS as LanguageSelect
  participant ST as useAppStore
  participant W as wouter.setLocation
  participant M as MapPage
  participant Q as useNearbyVenues
  participant F as apiFetch
  participant B as GET /api/venues/nearby

  U->>LS: Click 1 ngôn ngữ
  LS->>ST: setLanguage(code)
  LS->>W: setLocation("/map")
  W->>M: Mount MapPage
  M->>Q: queryFn()
  Q->>F: apiFetch("/venues/nearby?...lang=")
  F->>B: GET /api/venues/nearby
  B-->>F: nearby venues
  F-->>Q: data
  Q-->>M: venues[]
```

Chú thích function:
- Frontend: `LanguageSelect.handleSelect`, `useAppStore.setLanguage`, `useNearbyVenues`.
- Backend: `router.get("/venues/nearby")`, `localize()`, `haversine()`.

### 8.2 Bản đồ, chọn vị trí và phát audio tự động

```mermaid
sequenceDiagram
  participant U as User
  participant ME as MapEvents.click
  participant AU as unlockAudio
  participant ST as useAppStore
  participant MP as MapPage.useEffect
  participant Q as useNearbyVenues
  participant T as getAudioUrl
  participant P as playAudioFromUrl
  participant B as GET /api/audio/:venueId

  U->>ME: Click lên bản đồ
  ME->>AU: unlockAudio()
  ME->>ST: setGpsPosition(lat, lng)
  ST-->>MP: gpsPosition thay đổi
  MP->>Q: refetch nearby venues
  Q-->>MP: venues[]
  MP->>T: getAudioUrl(venueId, lang)
  MP->>P: playAudioFromUrl(url, venueId)
  P->>B: GET /api/audio/:venueId?lang=
  B-->>P: mp3 stream hoặc cache hit
  P-->>MP: onEnd / onError
  MP-->>U: Hiển thị trạng thái đang phát
```

Chú thích function:
- Frontend: `MapEvents.onLocationClick`, `MapPage` proximity `useEffect`, `handleStopAudio`, `markVenuePlayed`, `unlockAudio`, `stopAudioTranscript`.
- Backend: `router.get("/:venueId")` trong `api-server/src/routes/audio.js`, `getTextAndLang()`, `acquireAudioLock()`, `waitForAudioCacheOrTakeover()`, `generateAudioFileWithRetry()`, `serveAudioFile()`.

### 8.3 Xem chi tiết quán, nghe audio, yêu thích, quét QR và gửi review

```mermaid
sequenceDiagram
  participant U as User
  participant VD as VenueDetail
  participant VQ as useVenueDetail
  participant R as useRespect
  participant QR as useQrTap
  participant RV as useCreateVenueReview
  participant A as apiFetch
  participant B1 as GET /api/venues/:id
  participant B2 as POST /api/venues/:id/respect
  participant B3 as POST /api/venues/:id/qr-tap
  participant B4 as POST /api/venues/:id/reviews

  U->>VD: Mở trang /venue/:id
  VD->>VQ: queryFn()
  VQ->>A: apiFetch("/venues/:id?lang=")
  A->>B1: GET /api/venues/:id
  B1-->>A: venue detail
  A-->>VQ: data
  VQ-->>VD: venue
  U->>VD: Click Audio Guide
  VD->>A: getAudioUrl() + playAudioFromUrl()
  A->>B1: GET /api/audio/:venueId?lang=
  B1-->>VD: mp3 stream
  U->>VD: Click Heart
  VD->>R: mutate(venueId)
  R->>A: apiFetch("/venues/:id/respect", POST)
  A->>B2: POST /api/venues/:id/respect
  B2-->>R: respectCount
  U->>VD: Click QR / Pay
  VD->>QR: mutate(venueId)
  QR->>A: apiFetch("/venues/:id/qr-tap", POST)
  A->>B3: POST /api/venues/:id/qr-tap
  U->>VD: Submit review
  VD->>RV: mutate({venueId, payload})
  RV->>A: apiFetch("/venues/:id/reviews", POST)
  A->>B4: POST /api/venues/:id/reviews
  B4-->>VD: lưu review / reject theo moderation
```

Chú thích function:
- Frontend: `VenueDetail.handlePlayAudio`, `handleRespect`, `handleQrTap`, `handleSubmitReview`.
- Hook: `useVenueDetail`, `useRespect`, `useQrTap`, `useCreateVenueReview`.
- Backend: `router.get("/venues/:id")`, `router.post("/venues/:id/respect")`, `router.post("/venues/:id/qr-tap")`, `router.post("/venues/:id/reviews")`, `moderateReviewContent()`, `enforceRateLimit()`, `markReviewOnce()`.

### 8.4 Chat AI gợi ý quán

```mermaid
sequenceDiagram
  participant U as User
  participant C as ChatBox.handleSend
  participant M as useSendChat
  participant A as apiFetch
  participant B as POST /api/chat
  participant AI as generateAiReply
  participant FB as buildSuggestionBundle

  U->>C: Nhập câu hỏi / quick reply
  C->>M: mutate({message, lang, userLat, userLng, history})
  M->>A: apiFetch("/chat", POST)
  A->>B: POST /api/chat
  B->>FB: buildSuggestionBundle()
  B->>AI: generateAiReply()
  B-->>A: reply / suggestedVenues / fallback
  A-->>M: data
  M-->>C: setMessages()
```

Chú thích function:
- Frontend: `ChatBox.handleSend`, `useSendChat`.
- Backend: `router.post("/chat")`, `generateAiReply()`, `buildSuggestionBundle()`, `toChatHistory()`, `formatVenueContext()`.

### 8.5 Đăng nhập, đăng ký vendor và phân luồng dashboard

```mermaid
sequenceDiagram
  participant U as User
  participant AP as AuthPage.handleLogin/handleRegister
  participant L as apiLogin
  participant RV as apiRegisterVendor
  participant A as apiFetch
  participant B1 as POST /api/auth/login
  participant B2 as POST /api/auth/register/vendor
  participant ST as useAppStore.setAuth
  participant W as navigate()

  U->>AP: Login form
  AP->>L: apiLogin(email, password)
  L->>A: apiFetch("/auth/login", POST)
  A->>B1: POST /api/auth/login
  B1-->>A: { user, accessToken }
  A-->>L: data
  L-->>AP: user + token
  AP->>ST: setAuth(user, accessToken)
  AP->>W: /admin/dashboard hoặc /vendor/dashboard hoặc /map
  U->>AP: Register vendor form
  AP->>RV: apiRegisterVendor(form)
  RV->>A: apiFetch("/auth/register/vendor", POST)
  A->>B2: POST /api/auth/register/vendor
  B2-->>AP: vendor pending
```

Chú thích function:
- Frontend: `AuthPage.handleLogin`, `AuthPage.handleRegister`.
- Backend: `router.post("/auth/login")`, `router.post("/auth/register/vendor")`, `signTokens()`, `requireAuth()` cho các route dashboard.

### 8.6 Thanh toán VNPay và tạo quán sau thanh toán

```mermaid
sequenceDiagram
  participant U as User/Vendor
  participant VP as VendorDashboard.handleRegister
  participant CP as createPayment.mutate
  participant A1 as POST /api/payment/create-order
  participant VNP as VNPay gateway
  participant RET as GET /api/payment/vnpay-return
  participant VD as VendorDashboard.useEffect
  participant CPoi as createPoi.mutate
  participant A2 as POST /api/pois

  U->>VP: Điền form quán và bấm đăng ký
  VP->>CP: mutate({amount, orderId, description, purpose})
  CP->>A1: POST /api/payment/create-order
  A1-->>CP: paymentUrl, paymentId
  CP-->>VP: paymentUrl
  VP->>VNP: window.location.href = paymentUrl
  VNP->>RET: Redirect return URL sau thanh toán
  RET-->>VNP: verify signature + update Payment
  RET-->>VP: /vendor/dashboard?payment=success&paymentId=...
  VP->>VD: useEffect đọc query params + localStorage draft
  VD->>CPoi: mutate({ ...draft, paymentId })
  CPoi->>A2: POST /api/pois
  A2-->>VD: POI pending
```

Chú thích function:
- Frontend thanh toán riêng: `PaymentPage.handleCreatePayment` + `useCreatePayment`.
- Frontend vendor dashboard: `VendorDashboard.handleRegister`, effect đọc query `payment=success`, `PENDING_POI_DRAFT_KEY`.
- Backend payment: `router.post("/payment/create-order")`, `router.get("/payment/vnpay-return")`, `router.post("/payment/vnpay-ipn")`, `router.get("/payment/status/:paymentId")`.
- Backend POI: `router.post("/pois")` kiểm tra `paymentId`, tạo `Poi` trạng thái `pending`, rồi gắn `landingUrl` và `landingQrImageUrl`.

### 8.7 Admin duyệt quán và quản lý user

```mermaid
sequenceDiagram
  participant U as Admin
  participant AD as AdminDashboard
  participant S as useAdminStats/useAdminPending/useAdminUsers/useAdminVenues
  participant A as apiFetch
  participant B1 as GET /api/admin/stats
  participant B2 as GET /api/admin/pending
  participant B3 as GET /api/admin/users
  participant B4 as GET /api/admin/venues
  participant AP as useApprovePoi/useRejectPoi/useAdminUpdateUserStatus/useDeletePoi
  participant C1 as PATCH /api/pois/:id/approve
  participant C2 as PATCH /api/pois/:id/reject
  participant C3 as PATCH /api/admin/users/:id/status
  participant C4 as DELETE /api/pois/:id

  U->>AD: Mở dashboard
  AD->>S: load stats/pending/users/venues
  S->>A: apiFetch cho từng query
  A->>B1: GET /api/admin/stats
  A->>B2: GET /api/admin/pending
  A->>B3: GET /api/admin/users
  A->>B4: GET /api/admin/venues
  U->>AD: Click Approve/Reject/User status/Delete
  AD->>AP: mutate(...)
  AP->>A: apiFetch(route tương ứng)
  A->>C1: PATCH /api/pois/:id/approve
  A->>C2: PATCH /api/pois/:id/reject
  A->>C3: PATCH /api/admin/users/:id/status
  A->>C4: DELETE /api/pois/:id
```

Chú thích function:
- Frontend: `AdminDashboard.handleApprove`, `handleReject`, `handleUserStatus`, `handleDeleteVenue`, `handleLogout`.
- Hook: `useAdminStats`, `useAdminPending`, `useAdminUsers`, `useAdminVenues`, `useApprovePoi`, `useRejectPoi`, `useAdminUpdateUserStatus`, `useDeletePoi`.
- Backend: `router.get("/admin/stats")`, `router.get("/admin/pending")`, `router.patch("/admin/pending/:id")`, `router.patch("/admin/users/:id/status")`, `router.get("/admin/users")`, `router.get("/admin/venues")`.

### 8.8 Bảng tra nhanh function theo chức năng

- Chọn ngôn ngữ: `LanguageSelect.handleSelect`, `useAppStore.setLanguage`.
- Khám phá quán gần: `MapPage` proximity `useEffect`, `useNearbyVenues`, `router.get("/venues/nearby")`.
- Phát audio: `MapPage` + `playAudioFromUrl`, `router.get("/:venueId")` trong `audio.js`.
- Chi tiết quán: `VenueDetail.handlePlayAudio`, `handleRespect`, `handleQrTap`, `handleSubmitReview`.
- Chat AI: `ChatBox.handleSend`, `useSendChat`, `router.post("/chat")`.
- Đăng nhập/đăng ký: `AuthPage.handleLogin`, `AuthPage.handleRegister`, `router.post("/auth/login")`, `router.post("/auth/register/vendor")`.
- Thanh toán: `VendorDashboard.handleRegister`, `PaymentPage.handleCreatePayment`, `router.post("/payment/create-order")`.
- Tạo quán sau payment: effect trong `VendorDashboard`, `router.post("/pois")`.
- Duyệt quán: `AdminDashboard.handleApprove`, `handleReject`, `handleUserStatus`, `handleDeleteVenue`.
