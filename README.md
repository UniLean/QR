# QR Code Generator - Trình tạo mã QR chuyên nghiệp

Một ứng dụng web hiện đại để tạo mã QR với nhiều tùy chọn tùy biến và giao diện đẹp mắt.

## 🌟 Tính năng chính

### ✨ Tùy chỉnh mã QR
- **Kích thước linh hoạt**: Từ 100px đến 500px
- **Màu sắc tùy chỉnh**: Màu nền và màu mã QR có thể thay đổi
- **Mức sửa lỗi**: 4 mức độ từ thấp đến rất cao (7%-30%)
- **Bo viền**: Tùy chỉnh độ bo góc từ 0-50px
- **Khoảng cách viền**: Điều chỉnh margin của mã QR

### 🖼️ Logo nhúng
- Hỗ trợ nhúng logo/hình ảnh vào giữa mã QR
- Tự động điều chỉnh kích thước logo (20% kích thước QR)
- Giới hạn file 5MB để đảm bảo hiệu suất
- Hỗ trợ các định dạng: JPG, PNG, GIF, WebP

### 🎨 Giao diện hiện đại
- Thiết kế responsive, hoạt động tốt trên mọi thiết bị
- Hiệu ứng animation mượt mà
- Màu sắc gradient đẹp mắt
- Font chữ hiện đại và dễ đọc

### 📱 Tính năng tiện ích
- **Xem trước realtime**: Cập nhật mã QR ngay khi thay đổi
- **Tải xuống chất lượng cao**: Định dạng PNG với độ phân giải cao
- **Thông tin chi tiết**: Hiển thị thông tin về mã QR đã tạo
- **Đặt lại nhanh**: Nút reset để về cài đặt mặc định

## 🚀 Cách sử dụng

1. **Mở file `index.html`** trong trình duyệt web
2. **Nhập URL hoặc văn bản** vào ô input
3. **Tùy chỉnh các thiết lập** theo ý muốn:
   - Kéo thanh trượt để thay đổi kích thước
   - Chọn màu sắc bằng color picker
   - Chọn mức sửa lỗi phù hợp
   - Upload logo nếu muốn
4. **Xem trước** mã QR được tạo ở bên phải
5. **Tải xuống** file PNG chất lượng cao

## 🎯 Các trường hợp sử dụng

- **Website/Blog**: Tạo QR code cho URL website
- **Mạng xã hội**: QR code cho profile social media
- **Sự kiện**: QR code cho thông tin sự kiện, vé
- **Kinh doanh**: QR code cho thông tin liên hệ, menu
- **Giáo dục**: QR code cho tài liệu, bài giảng
- **Marketing**: QR code cho campaign quảng cáo

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web semantic
- **CSS3**: Styling hiện đại với Flexbox/Grid
- **JavaScript (ES6+)**: Logic xử lý và tương tác
- **QRCode.js**: Thư viện tạo mã QR chất lượng cao
- **Font Awesome**: Icon đẹp và đa dạng
- **Canvas API**: Xử lý hình ảnh và export

## 📋 Yêu cầu hệ thống

- **Trình duyệt hiện đại**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript được bật**: Cần thiết cho tất cả tính năng
- **Kết nối internet**: Để tải Font Awesome và QRCode.js từ CDN

## 🎨 Tùy chỉnh nâng cao

### Màu sắc
- Hỗ trợ cả color picker và nhập mã hex
- Tự động đồng bộ giữa 2 loại input
- Validation mã màu hex

### Mức sửa lỗi
- **L (Low)**: 7% - Phù hợp cho môi trường sạch
- **M (Medium)**: 15% - Cân bằng giữa kích thước và độ tin cậy
- **Q (Quartile)**: 25% - Tốt cho môi trường có thể bị hỏng nhẹ
- **H (High)**: 30% - Tối ưu cho môi trường khắc nghiệt

### Logo nhúng
- Logo được đặt ở giữa mã QR
- Tự động tạo nền trắng cho logo
- Kích thước logo = 20% kích thước QR
- Không ảnh hưởng đến khả năng quét

## 🔧 Xử lý lỗi

Ứng dụng có hệ thống xử lý lỗi toàn diện:
- Validation input URL/text
- Kiểm tra kích thước file logo
- Thông báo lỗi thân thiện
- Fallback cho các trình duyệt cũ

## 📱 Responsive Design

- **Desktop**: Layout 2 cột với đầy đủ tính năng
- **Tablet**: Tối ưu cho màn hình trung bình
- **Mobile**: Layout 1 cột, điều chỉnh kích thước phù hợp

## 🎯 Performance

- **Lazy loading**: Tải thư viện khi cần thiết
- **Debouncing**: Tránh tạo QR code quá nhiều lần
- **Canvas optimization**: Tối ưu việc vẽ và export
- **File size limit**: Giới hạn 5MB cho logo

## 📄 License

Dự án này được phát hành dưới giấy phép MIT. Bạn có thể sử dụng, sửa đổi và phân phối tự do.

## 🤝 Đóng góp

Nếu bạn muốn đóng góp cho dự án:
1. Fork repository
2. Tạo branch mới cho tính năng
3. Commit thay đổi
4. Tạo Pull Request

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc có đề xuất, vui lòng tạo issue trên GitHub hoặc liên hệ trực tiếp.

---

**Tạo bởi AI Assistant** - Ứng dụng QR Code Generator hiện đại và mạnh mẽ 🚀
