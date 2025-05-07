# 🎓 Chatbot Tư Vấn Tuyển Sinh – Đại học Văn Lang

Ứng dụng chatbot hỗ trợ tư vấn tuyển sinh trực tuyến cho Trường Đại học Văn Lang. Người dùng có thể đặt câu hỏi liên quan đến ngành học, học phí, phương thức xét tuyển,… và nhận phản hồi tự động từ chatbot sử dụng mô hình ngôn ngữ lớn - GPT 4.0

---

## 🔧 Công nghệ sử dụng

### ⚙️ Hệ thống chính
- **Frontend**: `ReactJS`, `Tailwind CSS` – Giao diện hiện đại, thân thiện người dùng.
- **Backend**: `Node.js`, `Express` – Xử lý API, kết nối MongoDB và Vector DB `Weaviate`.
- **Chatbot**: `Botpress` – Nền tảng hội thoại tích hợp LLM, phản hồi thông minh.

### 📦 Thư viện & Công cụ
- **Clerk**: Xác thực và quản lý người dùng (đăng nhập, phân quyền, đăng xuất).
- **React Query**: Quản lý truy vấn và cache dữ liệu phía client.
- **Redux Toolkit + Thunk**: Quản lý trạng thái tập trung và logic bất đồng bộ.
- **Material UI (MUI)**: Bộ UI components hiện đại, dễ sử dụng.
- **React Markdown**: Hiển thị nội dung phản hồi của chatbot theo định dạng Markdown.
- **React Type Animation**: Tạo hiệu ứng gõ chữ sinh động trong giao diện chat.
- **ImageKit**: Nén, tối ưu và phân phối hình ảnh giúp tăng tốc độ tải trang.
- **Botpress Client**: Giao tiếp API với Botpress, tự xây dựng UI hội thoại.

---

## 📌 Các chức năng chính

### 👤 Người dùng
- Đăng ký / Đăng nhập tài khoản
- Quản lý hồ sơ cá nhân
- Trò chuyện với chatbot để nhận tư vấn tuyển sinh

### 🛠️ Quản trị viên
- Xem lịch sử hội thoại của người dùng
- Quản lý tài khoản và thông tin người dùng

---

## 🚀 Tính năng mở rộng (dự kiến)
- 📚 **FAQ**: Câu hỏi thường gặp về chức năng của hệ thống
- 📊 **Dashboard thống kê**: Lượt truy cập, số cuộc trò chuyện theo thời gian
- 🔍 **Tìm kiếm hội thoại**: Tra cứu theo từ khóa trong lịch sử chat
- 💬 **Câu hỏi gợi ý**: Danh sách câu hỏi mẫu trong giao diện chat

---

## ▶️ Cách chạy dự án

```bash
# Khởi động frontend
cd frontend
npm install
npm run dev

# Khởi động backend
cd backend
npm install
npm run start
