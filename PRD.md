# PRD - Smart Food Tour

## 1. Tổng quan sản phẩm

Smart Food Tour là nền tảng du lịch ẩm thực đa ngôn ngữ cho khách du lịch, vendor và admin. Sản phẩm cho phép người dùng chọn ngôn ngữ, tìm quán gần vị trí hiện tại, xem chi tiết quán trên bản đồ, nghe thuyết minh audio, hỏi AI để nhận gợi ý địa điểm và tương tác với quán qua review, respect hoặc QR. Song song, hệ thống cung cấp luồng đăng ký quán cho vendor, thanh toán VNPay, và cơ chế duyệt nội dung cho admin.

Sản phẩm hiện được triển khai theo mô hình web app, frontend React/Vite và backend Express/MongoDB. Các luồng được tối ưu cho mobile trước vì phần lớn người dùng sẽ truy cập trên điện thoại khi đang di chuyển.

## 2. Mục tiêu sản phẩm

### 2.1 Mục tiêu kinh doanh

- Tăng khả năng khám phá quán ăn cho khách du lịch không nói tiếng địa phương.
- Tạo một kênh giới thiệu quán ăn có tính tương tác cao thay cho brochure tĩnh.
- Chuẩn hóa luồng onboard vendor bằng đăng ký, thanh toán, duyệt quán và xuất hiện công khai.
- Cung cấp dữ liệu vận hành để admin theo dõi traffic, audio plays, review, respect và trạng thái quán.

### 2.2 Mục tiêu người dùng

- Khách du lịch có thể vào app, hiểu nội dung bằng ngôn ngữ của họ và nhanh chóng tìm quán phù hợp.
- Vendor có thể đăng ký quán và theo dõi trạng thái thanh toán/duyệt rõ ràng.
- Admin có thể kiểm soát chất lượng nội dung trước khi POI được công khai.

## 3. Vấn đề cần giải quyết

### 3.1 Với khách du lịch

- Khó tìm quán phù hợp khi không hiểu tiếng địa phương.
- Không biết quán nào đang mở, gần mình, hợp khẩu vị hoặc hợp ngân sách.
- Khó đọc menu, giờ mở cửa, đường đi và thông tin chi tiết.
- Cần một trải nghiệm nghe thuyết minh tự động thay vì phải đọc văn bản dài.

### 3.2 Với vendor

- Không có quy trình đăng ký quán có kiểm soát, gây khó quản lý dữ liệu.
- Cần thanh toán phí đăng ký rõ ràng trước khi được kích hoạt tính năng tạo quán.
- Cần dashboard để xem thống kê cơ bản về điểm bán của mình.

### 3.3 Với admin

- Cần phê duyệt POI trước khi hiển thị công khai.
- Cần danh sách user, danh sách quán chờ duyệt và thống kê hoạt động toàn hệ thống.
- Cần công cụ khóa/mở user và xử lý các trường hợp nội dung không đạt yêu cầu.

## 4. Phạm vi sản phẩm

### 4.1 In scope

- Chọn và lưu ngôn ngữ người dùng.
- Bản đồ quán gần vị trí hiện tại.
- Màn chi tiết quán với menu, review, gallery, giờ mở cửa.
- Phát audio thuyết minh theo vị trí và ngôn ngữ.
- Chat AI gợi ý quán phù hợp.
- Gửi review, respect, QR tap tracking.
- Vendor login, vendor dashboard, tạo POI mới.
- Thanh toán VNPay cho luồng đăng ký quán.
- Admin dashboard để duyệt quán, quản lý user và xem báo cáo.

### 4.2 Out of scope

- Đặt bàn, gọi món hoặc giao hàng trực tiếp.
- Thanh toán tại quán cho khách du lịch ngoài luồng đăng ký vendor.
- GPS thật theo thiết bị ở phiên bản hiện tại, vì app đang dùng vị trí giả lập bằng click map.
- Đồng bộ real-time qua socket; hiện tại dữ liệu chủ yếu được cập nhật qua React Query refetch.

## 5. Personas

### 5.1 Khách du lịch

**Mục tiêu:** tìm quán hợp ngôn ngữ, dễ hiểu, gần vị trí, nghe được giới thiệu nhanh.

**Nhu cầu chính:**
- Chọn ngôn ngữ giao diện.
- Tìm quán theo vị trí.
- Xem thông tin ngắn gọn, trực quan.
- Hỏi AI thay vì phải tra cứu thủ công.

### 5.2 Vendor

**Mục tiêu:** đăng ký quán, thanh toán phí, chờ duyệt và quản lý POI của mình.

**Nhu cầu chính:**
- Luồng đăng ký rõ ràng.
- Biết payment nào đã dùng cho POI nào.
- Sửa thông tin quán khi cần.
- Theo dõi thống kê tương tác.

### 5.3 Admin

**Mục tiêu:** kiểm soát chất lượng dữ liệu và vận hành hệ thống.

**Nhu cầu chính:**
- Duyệt/từ chối quán.
- Quản lý user và trạng thái hoạt động.
- Xem báo cáo tổng quan.

## 6. Sơ đồ màn hình chính

### 6.1 Guest flow screens

- Trang chọn ngôn ngữ.
- Trang bản đồ.
- Trang chi tiết quán.
- Hộp chat AI nổi.
- Trang thanh toán thành công/thất bại cho trường hợp vendor.

### 6.2 Vendor flow screens

- Trang đăng nhập/đăng ký quán.
- Trang thanh toán VNPay.
- Dashboard vendor.
- Form tạo/sửa quán.

### 6.3 Admin flow screens

- Dashboard tổng hợp.
- Danh sách quán chờ duyệt.
- Danh sách quán toàn hệ thống.
- Danh sách user.
- Khu vực báo cáo.

## 7. Yêu cầu chức năng chi tiết

### FR1 - Chọn ngôn ngữ

#### Mô tả
Người dùng chọn ngôn ngữ ngay từ màn đầu tiên để toàn bộ UI và nội dung thuyết minh được hiển thị theo ngôn ngữ đã chọn.

#### Hành vi mong đợi
- Có danh sách 15 ngôn ngữ.
- Ngôn ngữ được lưu vào store và giữ lại giữa các lần truy cập.
- Nội dung map, venue detail, chat và audio dùng ngôn ngữ hiện tại.

#### Acceptance criteria
- Người dùng chọn tiếng Việt thì trang tiếp theo và dữ liệu API đều dùng `vi`.
- Tải lại trang không mất ngôn ngữ đã chọn.

### FR2 - Khám phá địa điểm trên bản đồ

#### Mô tả
Map page hiển thị các POI đã approved, sắp xếp theo khoảng cách hoặc theo dữ liệu phù hợp với vị trí hiện tại của người dùng.

#### Hành vi mong đợi
- Người dùng click vào bản đồ để đổi vị trí giả lập.
- App gọi API nearby venues theo lat/lng và language.
- Danh sách sidebar cập nhật theo khoảng cách.
- Chạm vào card sẽ mở màn chi tiết quán.

#### Acceptance criteria
- Chỉ POI `approved` mới xuất hiện công khai.
- Khi user đổi vị trí, nearby list thay đổi tương ứng.

### FR3 - Audio thuyết minh tự động

#### Mô tả
Hệ thống phát audio thuyết minh cho quán khi người dùng tiến vào bán kính kích hoạt.

#### Hành vi mong đợi
- Audio được tải từ backend theo `venueId` và `lang`.
- Audio chỉ phát một lần cho mỗi venue trong một session.
- Khi user ra khỏi bán kính thì audio dừng.
- Khi browser chặn autoplay, app phải unlock audio sau tương tác đầu tiên.
- Khi nhiều user cùng nghe 1 quán, backend chỉ nên sinh 1 bản audio và các request còn lại dùng lại cache.
- Khi user đứng trong phạm vi của nhiều quán cùng lúc, hệ thống phải có quy tắc ưu tiên rõ ràng.

#### Acceptance criteria
- Vào vùng kích hoạt thì audio tự chạy.
- Ra khỏi vùng thì audio dừng ngay.
- Reload page không bị autoplay crash.
- Trong tình huống nhiều request đồng thời cho cùng `venueId + lang`, hệ thống không phát sinh nhiều tiến trình generate MP3 giống nhau.
- Nếu đồng thời nằm trong phạm vi 2 quán, hệ thống ưu tiên quán gần nhất (dựa trên danh sách nearby đã sort theo distance).
- Nếu đang phát quán A thì không tự nhảy sang quán B cho đến khi quán A ra khỏi phạm vi hoặc phát xong.

### FR4 - Chat AI gợi ý địa điểm

#### Mô tả
Người dùng chat với AI để hỏi địa điểm phù hợp theo nhu cầu thực tế.

#### Hành vi mong đợi
- Chat nhận ngôn ngữ và vị trí hiện tại.
- AI phải trả lời đúng ngôn ngữ của user.
- Nếu AI không sẵn sàng, hệ thống fallback sang các gợi ý cục bộ.
- Chat history chỉ giữ một số tin nhắn gần nhất để tránh prompt quá dài.

#### Acceptance criteria
- Hỏi “nearest restaurant” trả về venue gần nhất hoặc nhóm venue gần nhất.
- Hỏi “vegetarian” chỉ gợi ý quán chay nếu có dữ liệu.

### FR5 - Trang chi tiết quán

#### Mô tả
Trang venue detail là nơi người dùng xem hero image, rating, giờ mở cửa, menu, gallery, reviews và các nút hành động chính.

#### Hành vi mong đợi
- Hiển thị thông tin đa ngôn ngữ.
- Có tabs để chuyển giữa About/Menu/Reviews.
- Có nút audio guide, respect và pay/QR.
- Người dùng có thể gửi review ngay từ trang này.

#### Acceptance criteria
- Nếu quán có gallery, ảnh hiển thị được trên mobile lẫn desktop.
- Form review hoạt động và refresh lại dữ liệu sau khi post thành công.

### FR6 - Review, respect và QR tap

#### Mô tả
Khách du lịch có thể tương tác nhẹ với quán bằng review, respect hoặc quét QR.

#### Hành vi mong đợi
- Review dùng guest token để phân biệt người dùng ẩn danh.
- Review không yêu cầu đăng nhập tài khoản (anonymous comment bằng guest token).
- Review có chống spam cơ bản: rate limit, blocked words, duplicate check.
- Respect tăng bộ đếm yêu thích.
- QR tap tăng thống kê tương tác.
- QR quét phải mở được trang quán để người dùng có thể bấm nghe audio ngay.

#### Acceptance criteria
- Người dùng ẩn danh vẫn gửi review được.
- Review chứa link hoặc từ cấm bị từ chối.
- QR landing hợp lệ phải dẫn về ngữ cảnh quán tương ứng và cho phép nghe audio guide.

### FR7 - Vendor đăng ký và thanh toán

#### Mô tả
Vendor phải thanh toán VNPay trước khi được dùng luồng tạo POI cho mục đích đăng ký quán.

#### Hành vi mong đợi
- Vendor tạo payment order.
- Backend trả về payment URL.
- Sau VNPay return/IPN, payment được cập nhật success hoặc failed.
- Payment thành công sẽ được dùng để gắn với POI mới.

#### Acceptance criteria
- Không có payment thành công thì vendor không tạo được POI registration mới.
- Payment success phải được lưu transactionNo, bankCode, paidAt.

### FR8 - Tạo, sửa, xóa POI

#### Mô tả
Vendor có thể quản lý quán của mình, admin có quyền cao hơn để xử lý mọi POI.

#### Hành vi mong đợi
- Vendor tạo POI mới ở trạng thái pending.
- Khi sửa tên hoặc mô tả, hệ thống dịch lại đa ngôn ngữ.
- Admin có thể approve/reject/delete.
- Vendor không xóa được POI đã approved nếu không phải admin.

#### Acceptance criteria
- POI mới không xuất hiện công khai cho đến khi admin duyệt.
- Chỉnh nội dung chính phải làm sạch cache audio cũ.

### FR9 - Admin duyệt nội dung

#### Mô tả
Admin quản lý danh sách POI chờ duyệt và quyết định approve/reject.

#### Hành vi mong đợi
- Có danh sách pending venues.
- Có thể nhập lý do từ chối.
- Sau khi approve/reject, dữ liệu cache được invalidate để map cập nhật.

#### Acceptance criteria
- POI approved xuất hiện trên map guest.
- POI rejected lưu rejectedReason.

### FR10 - Admin quản lý user và thống kê

#### Mô tả
Admin có dashboard tổng hợp số liệu vận hành.

#### Hành vi mong đợi
- Thống kê total venues, total vendors, pending approvals, total audio plays, online users, online guests.
- Danh sách user cho phép đổi status.
- Báo cáo hiển thị theo thời gian và danh mục.
- Chỉ số online phải có định nghĩa thống nhất theo cửa sổ thời gian.

#### Acceptance criteria
- Admin thấy số liệu hợp lệ theo dữ liệu hiện tại.
- Chuyển trạng thái user cập nhật ngay trong danh sách.
- `onlineUsers` được tính từ `lastSeenAt` trong cửa sổ cấu hình (mặc định 5 phút), `onlineGuests` lấy từ Redis online guest tracking.

## 8. Yêu cầu dữ liệu

### 8.1 User

Trường chính:
- email
- password
- name
- phone
- role: member | vendor | admin
- status: active | pending | blocked
- shopName
- preferredLang
- lastSeenAt

#### Ghi chú
- Password được hash trước khi lưu.
- Password không được trả về client.

### 8.2 POI

Trường chính:
- id
- name
- nameLocal
- description
- descriptionLocal
- category
- lat, lng
- location
- address
- rating
- reviewCount
- imageUrl
- gallery
- isOpen
- audioRadius
- priceRange
- tags
- phone
- website
- hours
- menu
- reviews
- hasAudio
- audioLanguages
- audioTranscripts
- respectCount
- status
- rejectedReason
- vendorId
- landingUrl
- landingQrImageUrl
- qrImageUrl
- qrTapCount

#### Ghi chú
- POI dùng slug id riêng để lookup.
- `location` phục vụ tìm kiếm geo.
- `status` quyết định POI có xuất hiện công khai hay không.

### 8.3 Payment

Trường chính:
- userId
- orderId
- amount
- description
- paymentMethod
- status
- paymentUrl
- transactionNo
- bankCode
- responseCode
- message
- paymentCode
- poiId
- usedForPoiAt
- registrationClaimedAt
- paidAt

#### Ghi chú
- `paymentCode` phân biệt payment cho mục đích gì, hiện luồng chính là `poi_registration`.
- `status` dùng để kiểm tra payment nào đã dùng xong, payment nào chưa.

## 9. Yêu cầu phi chức năng

### 9.1 Responsive

- App phải hiển thị tốt trên mobile trước, sau đó đến tablet và desktop.
- Sidebar map, chat box và dashboard phải co giãn hợp lý trên màn nhỏ.

### 9.2 Bảo mật

- Route cần đăng nhập phải có JWT.
- Route cần phân quyền phải check role rõ ràng.
- Refresh token được lưu trong httpOnly cookie.

### 9.3 Hiệu năng

- Map query phải chỉ lấy dữ liệu cần thiết.
- Audio file phải cache để tránh generate lặp.
- Chat request nên giới hạn history để prompt không quá dài.
- Với production, nên bật Redis để khóa phân tán audio generation khi tải đồng thời cao.

### 9.4 Tính ổn định

- Nếu OpenRouter lỗi, chat vẫn phải trả fallback content.
- Nếu gTTS hoặc audio cache lỗi, hệ thống vẫn phải không làm hỏng giao diện chính.
- Nếu VNPay chưa cấu hình đủ, payment phải trả lỗi rõ ràng.
- Nếu request audio cạnh tranh lock quá lâu, hệ thống phải trả lỗi tạm thời rõ ràng để client retry.

### 9.5 Chống spam và kiểm soát dữ liệu

- Review phải có rate limit.
- Review phải lọc link và từ cấm.
- POI sửa nội dung quan trọng phải làm sạch audio cache cũ.

## 10. Luồng nghiệp vụ chi tiết

### 10.1 Guest discovery

1. User vào app và chọn ngôn ngữ.
2. App lưu language vào store.
3. User vào map.
4. User click trên map để đổi vị trí giả lập.
5. App gọi nearby venues.
6. Sidebar hiện danh sách quán gần nhất.
7. Nếu quán nằm trong bán kính audio, audio tự phát.
8. User mở chi tiết quán để xem thêm thông tin.
9. User có thể xem review, nhấn respect, quét QR hoặc chat AI.
10. Nếu user đứng trong vùng overlap của nhiều quán, app ưu tiên phát audio quán gần nhất trước.

### 10.2 Vendor onboarding

1. Vendor đăng nhập.
2. Vendor truy cập payment page.
3. Tạo payment order.
4. VNPay xử lý giao dịch.
5. Return/IPN cập nhật payment status.
6. Vendor quay về dashboard.
7. Vendor tạo POI mới và đính kèm payment đã thanh toán.
8. POI ở trạng thái pending cho tới khi admin duyệt.

### 10.3 Admin moderation

1. Admin đăng nhập.
2. Admin xem dashboard.
3. Admin mở tab pending.
4. Admin duyệt hoặc từ chối POI.
5. Nếu duyệt thì POI xuất hiện trên map guest.
6. Nếu từ chối thì POI lưu lý do từ chối để vendor biết chỉnh sửa.

### 10.4 QR scan nghe audio

1. User quét QR của quán.
2. QR mở `landingUrl` của quán trên web app.
3. User vào trang chi tiết quán hoặc map context của quán đó.
4. User bấm audio guide hoặc vào vùng audio để nghe thuyết minh.
5. Hệ thống ghi nhận `qrTap` để phục vụ thống kê.

## 11. Chỉ số thành công

- Người dùng có thể vào map và hiểu được ít nhất một quán trong vòng vài chạm.
- POI approved xuất hiện chính xác sau khi được admin duyệt.
- Vendor hoàn thành payment và tạo quán mà không bị mơ hồ về trạng thái.
- Audio và chatbot hoạt động ổn định trên luồng chính.
- Admin xử lý pending venue và user status nhanh, không cần thao tác thủ công ngoài hệ thống.

## 12. Rủi ro và giả định

- Người dùng hiện chưa dùng GPS thật, nên trải nghiệm khám phá phụ thuộc vào click map.
- Chất lượng audio phụ thuộc dịch vụ gTTS và cache file trên backend.
- Chat AI phụ thuộc API key OpenRouter và model upstream.
- Thanh toán phụ thuộc cấu hình VNPay, môi trường sandbox/production và callback đúng URL.
- Bản dịch đa ngôn ngữ phụ thuộc khả năng dịch của provider được chọn.

## 13. Gợi ý mở rộng phiên bản sau

- Hỗ trợ GPS thật trên mobile.
- Thêm lưu lịch sử favorite và itinerary cá nhân.
- Thêm đặt bàn hoặc gọi món trực tiếp.
- Thêm realtime update bằng socket.
- Thêm analytics sâu hơn cho vendor.

