# CỘNG ĐỒNG ĐỌC SÁCH HẠNH PHÚC

Ứng dụng Next.js, React, Three.js và Neon Postgres.
Website: https://cong-dong-doc-sach-hanh-phuc.vercel.app

## Bắt đầu trên máy mới

Cài Node.js 24 LTS và Git (hoặc GitHub Desktop), sau đó:

```sh
git clone https://github.com/camtiensinh/cong-dong-doc-sach-hanh-phuc.git
cd cong-dong-doc-sach-hanh-phuc
npm ci
```

Sao chép `.env.example` thành `.env.local`. Lấy `DATABASE_URL` từ Vercel → project `cong-dong-doc-sach-hanh-phuc` → Settings → Environment Variables, hoặc nhận file `.env.local` riêng từ máy cũ. Không đưa khóa này vào GitHub, tin nhắn công khai hay ảnh chụp.

```sh
npm run dev
```

Mở http://localhost:3000. Không cần Vercel CLI và không cần cài PostgreSQL/Neon trên máy.
Nếu chưa có DATABASE_URL, có thể khám phá chế độ trải nghiệm; đăng ký, CMS và dữ liệu chung cần DB thật.

**Lưu ý:** dùng DATABASE_URL production sẽ đọc/ghi dữ liệu thật. Để thử tính năng có sửa dữ liệu, tạo Neon branch riêng rồi dùng connection string của branch đó.

## Kiểm tra và cập nhật website

```sh
npm test
npm run build
git add .
git commit -m "Describe your change"
git push origin main
```

Nếu Vercel đã kết nối repository và bật auto deployment, push lên `main` sẽ tự triển khai production. Kiểm tra Vercel → Settings → Git nếu chưa thấy bản deploy mới. Các biến môi trường vẫn giữ trong Vercel, không đi theo repository. Không cần chạy Vercel CLI trên máy mới.

## Dữ liệu và tài nguyên

- Repository chứa code, font, bản đồ, logo, ảnh 3D và hai file nhạc trong `public/music`.
- Tài khoản, sách CMS, audio, lịch chiếu, điểm, lịch sử và ghi chú nằm trong Neon; clone code không tạo bản sao DB.
- Google Drive audio và YouTube vẫn dùng nguồn online, cần quyền chia sẻ phù hợp.
- Giữ project Neon/Vercel hiện tại để tiếp tục dữ liệu. Sao lưu DB riêng bằng Neon trước khi thay đổi lớn.
- API tự khởi tạo bảng khi kết nối DB; DB trống không tự có toàn bộ nội dung đã nhập.
- `.env.local`, `.vercel`, `node_modules`, bản build và file tạm được bỏ qua.

## Cấu trúc chính

- `components/ReadingApp.tsx`: giao diện ứng dụng, đăng nhập, CMS.
- `components/RoomExperience.tsx`, `ReadingWorld.tsx`: phòng đọc, nhân vật, thời gian, ghi chú.
- `components/AudioLibrary.tsx`: tìm và nghe audio.
- `components/Garden.tsx`, `ChallengeTree.tsx`: nông trại cộng đồng và cây hành trình.
- `components/CompetitionReport.tsx`: bảng xếp hạng tuần/tháng.
- `app/api/state/route.ts`, `app/api/rooms/route.ts`: API Neon và phòng đọc.
- `app/immersive.css`, `app/globals.css`: giao diện sáng/tối, responsive.

CMS tại `/admin`, tài khoản quản trị hiện có được giữ trong Neon. Mật khẩu không lưu trong mã nguồn.
Đọc `AGENTS.md` và tài liệu Next.js trong `node_modules/next/dist/docs/` trước khi chỉnh sửa bằng coding agent.

Bản đồ lấy từ GeoVN: https://github.com/truongdinh018/GeoVN. Hoàng Sa và Trường Sa biểu diễn khái quát bằng hai cụm ký hiệu.
