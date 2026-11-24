# Hướng dẫn khởi động dự án Đọc sách Hạnh phúc

Repository riêng tư: https://github.com/camtiensinh/cong-dong-doc-sach-hanh-phuc

Website: https://cong-dong-doc-sach-hanh-phuc.vercel.app

## 1. Chuẩn bị máy mới

Cài đặt:

- Node.js 24 LTS (kèm npm).
- Git hoặc GitHub Desktop.
- VS Code hoặc trình soạn thảo bạn sử dụng.

Đăng nhập GitHub bằng tài khoản có quyền truy cập repository. Không cần cài Vercel CLI, Neon CLI hay PostgreSQL trên máy.

Kiểm tra trong Terminal:

```sh
node --version
npm --version
git --version
```

Trên Windows PowerShell, nếu npm bị chặn do Execution Policy, dùng `npm.cmd` thay cho `npm` trong các lệnh bên dưới.

## 2. Lấy mã nguồn

Mở Terminal tại thư mục muốn lưu dự án:

```sh
git clone https://github.com/camtiensinh/cong-dong-doc-sach-hanh-phuc.git
cd cong-dong-doc-sach-hanh-phuc
npm ci
```

Nếu đã clone trước đó, lưu hoặc commit thay đổi đang làm rồi cập nhật:

```sh
git pull origin main
npm ci
```

`npm ci` cài đúng phiên bản trong package-lock.json. Không cần chép node_modules từ máy cũ.

## 3. Cấu hình cơ sở dữ liệu

Sao chép `.env.example` thành `.env.local` tại thư mục gốc, ngang hàng package.json.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```sh
cp .env.example .env.local
```

Mở `.env.local`, điền connection string Neon thật:

```dotenv
DATABASE_URL=connection_string_Neon_cua_ban
```

Giá trị mẫu ở trên phải được thay bằng giá trị thật. Có thể lấy từ:

1. Vercel → project `cong-dong-doc-sach-hanh-phuc` → Settings → Environment Variables → DATABASE_URL, nếu tài khoản có quyền xem.
2. Neon Console → project/branch tương ứng → Connect.
3. Chuyển riêng file `.env.local` từ máy cũ qua kênh tin cậy.

Không đưa connection string vào GitHub, ảnh chụp, file hướng dẫn hay đoạn chat công khai. `.env.local` đã được Git bỏ qua.

**Chọn DB khi phát triển:** dùng kết nối production sẽ tác động dữ liệu thật. Để thử thêm/sửa/xóa, nên tạo Neon branch riêng và lấy kết nối branch đó. Khi dùng DB mới hoàn toàn, API có thể tạo bảng nhưng không tự có danh sách sách, tài khoản và lịch sử của DB hiện tại.

Nếu chưa có DATABASE_URL, bạn chỉ có thể khám phá chế độ trải nghiệm. Đăng ký, đăng nhập thật, CMS và dữ liệu chung cần Neon.

## 4. Khởi động để sửa giao diện và tính năng

```sh
npm run dev
```

Mở: http://localhost:3000

- Ứng dụng học viên: `/`.
- Quản trị: `/admin`, đăng nhập bằng tài khoản quản trị hiện có trong Neon.
- Sửa file và lưu, trình duyệt sẽ cập nhật trong chế độ phát triển.
- Dừng server bằng `Ctrl + C` trong Terminal.
- Sau khi đổi `.env.local`, dừng rồi khởi động lại server.

Nếu cổng 3000 đang được dùng, xem địa chỉ mà Terminal thông báo hoặc chọn cổng khác:

```sh
npm run dev -- --port 3001
```

Mở http://localhost:3001 nếu dùng lệnh trên.

## 5. Kiểm tra trước khi đưa lên website

```sh
npm test
npm run build
```

Chỉ đẩy bản cập nhật khi các kiểm tra đã hoàn tất thành công.

Muốn chạy thử bản production trên máy:

```sh
npm run build
npm start
```

`npm start` cần bản build có sẵn và không tự cập nhật theo từng lần sửa file.

## 6. Lưu thay đổi và cập nhật website

Trong thư mục dự án:

```sh
git status
git add .
git diff --cached --stat
git commit -m "Mo ta thay doi"
git push origin main
```

Kiểm tra các file chuẩn bị commit, không thêm file chứa mật khẩu hoặc dữ liệu xuất từ DB.

Repository đã được nối với Vercel. Push lên nhánh main sẽ kích hoạt deployment theo cấu hình Git của project. Mở Vercel → project → Deployments để xem trạng thái. Khi deployment thành công, kiểm tra website production.

Nếu chưa thấy bản mới:

- Kiểm tra deployment có báo lỗi build không.
- Kiểm tra Settings → Git đang kết nối đúng repository và nhánh production là main.
- Kiểm tra biến DATABASE_URL trên Vercel; file `.env.local` trên máy không được tải lên Vercel qua Git.

Không cần cài Vercel CLI trên máy mới để sử dụng quy trình này.

## 7. Các file cần biết

| Vị trí | Nội dung |
| --- | --- |
| components/ReadingApp.tsx | Ứng dụng chính, đăng nhập, menu và CMS |
| components/RoomExperience.tsx | Bảng đọc sách, audio, thời gian, ghi chú |
| components/ReadingWorld.tsx | Phòng đọc 3D và nhân vật |
| components/AudioLibrary.tsx | Tìm và nghe audio đúc kết |
| components/Garden.tsx | Nông trại cộng đồng |
| components/ChallengeTree.tsx | Cây 3D của hành trình 100 ngày |
| components/CompetitionReport.tsx | Bảng xếp hạng tuần/tháng |
| app/api/state/route.ts | API tài khoản, CMS và dữ liệu học tập |
| app/api/rooms/route.ts | API phòng đọc và hiện diện |
| app/immersive.css, app/globals.css | Giao diện và responsive |
| public/ | Logo, bản đồ, ảnh và nhạc |

Nếu dùng coding agent, đọc `AGENTS.md` và hướng dẫn tương ứng trong `node_modules/next/dist/docs/` trước khi sửa code.

## 8. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Không tìm thấy node/npm | Cài Node.js rồi mở lại Terminal |
| PowerShell chặn npm.ps1 | Dùng npm.cmd thay npm |
| GitHub báo repository không tồn tại | Đăng nhập tài khoản có quyền truy cập repo riêng tư |
| NeonDB chưa kết nối | Kiểm tra DATABASE_URL trong .env.local, rồi khởi động lại |
| Đăng nhập không được trên DB mới | DB mới chưa có tài khoản cũ; kiểm tra đang dùng đúng branch |
| Audio/YouTube không phát | Kiểm tra mạng và quyền chia sẻ nguồn; Google Drive cần cho phép người có link xem |
| Cài dependency lỗi | Kiểm tra Node.js, kết nối mạng rồi chạy lại npm ci |
| Build lỗi | Đọc lỗi đầu tiên trong Terminal, sửa rồi chạy lại npm run build |

## 9. Những gì nằm ngoài GitHub

Tài khoản, sách quản lý qua CMS, lịch chiếu, giọt nước, ghi chú và lịch sử đọc nằm trong Neon. Audio Drive và video YouTube vẫn nằm ở nguồn online. Clone GitHub không tạo bản sao các dữ liệu này.

Giữ project Vercel/Neon hiện tại để tiếp tục hệ thống đang chạy. Sao lưu DB qua Neon riêng trước các thay đổi lớn.
