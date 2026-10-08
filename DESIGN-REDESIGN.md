# A6Class — Đặc tả Redesign UI ("BẢNG LỚP 12A6")

> Nguồn quy phạm cho toàn bộ việc redesign UI. Bắt buộc đọc trước khi sửa bất kỳ
> trang nào. Kết luận đến từ 3 đợt audit bằng AI (ChatGPT, có nhìn ảnh screenshot
> thật) trên dữ liệu thật của lớp 12A6, đối chiếu với `classos-design-bible`.

## 1. Chẩn đoán hiện trạng (audit trên screenshot thật)

| Màn hình | Điểm hiện tại | Kết luận chính |
|---|---|---|
| Dashboard desktop 1440px | Anti-AI-slop **4/10**, personality 4.5/10, tổng execution 7.5/10 | "Đẹp, sạch, an toàn" nhưng **rất giống SaaS dashboard do AI sinh ra** |
| Dashboard mobile 390px | Giống AI/template **7.5/10** | Đang là "cột dọc chứa card" — **chưa mobile-first** |
| Feed desktop | Giống AI/template **7.5–8/10**, personality 4.5/10 | "Social feed template được làm đẹp", chưa phải bảng lớp |

**5 lỗi tệ nhất (gộp cả 3 audit), xếp theo severity:**

1. 🔴 Toàn bộ UI dùng visual grammar của AI-SaaS: gradient pastel, card bo tròn
   20–28px, outline icon nhỏ, pill mọi chỗ, shadow mờ, nền xanh lam nhạt.
2. 🔴 Hierarchy phẳng — card nào cũng cùng visual weight; hero kiêm quá nhiều việc
   (greeting + profile + 4 metric ≈ 500px) nên leaderboard (đã chọn là hero) bị chìm.
3. 🔴 Mobile: bottom nav che content; 4 metric 2×2 tốn ~200px; nested card
   (card trong card) ở announcement/task.
4. 🟠 Gamification đặt "lên" UI thay vì UI được xây quanh gamification — điểm không
   có delta/movement, task reward chìm trong metadata.
5. 🟠 Personality Việt Nam / tuổi 15–18 yếu: bỏ logo A6CLASS ra vẫn đoán được
   "app giáo dục quốc tế" → **thất bại brand test**.

## 2. Concept đã chốt: **"BẢNG LỚP 12A6"**

Digital class board + competition system. Không phải school-management software,
không phải gaming dashboard, không phải cute edtech.

- Lớp = một tập thể đang vận động → mọi phần của app đều có lý do:
  leaderboard → bảng thành tích; task → nhiệm vụ có điểm; post → dán lên bảng;
  QB → coach của lớp; dashboard → bảng lớp digital.
- Mood: warm paper, typography chắc, số điểm lớn, ít container, nhiều divider.
- **TUYỆT ĐỐI KHÔNG** thêm: noise/paper texture, doodle, sticker, tape,
  handwriting để "cosplay trường học" — đó cũng là AI-slop.

## 3. Design tokens mới (áp vào `globals.css`)

### Màu
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg` (canvas) | `#F5F1E8` | nền trang — warm, thay nền xanh `#EEF2F9` |
| `--surface` | `#FFFCF7` | card/surface — warm white |
| `--surface-hover` | `#F3EEE3` | hover |
| `--border` | `#DDD8CE` | border ấm, thay border xanh lam |
| `--text` | `#111827` | chữ chính (ink) |
| `--text-secondary` | `#4B5563` | chữ phụ |
| `--text-muted` | `#6B7280` | chữ mờ (đảm bảo AA trên nền ấm) |
| `--primary` | `#2563EB` (electric blue) | interaction color: link, active, CTA chính |
| `--accent` | `#C7F000` (acid lime) | **rất tiết chế**: winner, streak, highlight, marker ghim |
| `--gold` | `#FFB800` | huy chương / #1 (giữ DNA cũ) |
| Team | đỏ `#EF476F`, cam `#F59E0B`, xanh `#16A34A`, lam `#2563EB` | CHỈ trong context thi đua |

- BỎ gradient pastel ở background trang/hero. Không gradient chỉ để "đẹp".
- Không dùng acid lime làm background lớn hay nút chính.

### Radius — giảm mạnh (đây là thuốc chữa "AI-look")
- `--radius-sm: 8px`, `--radius-md: 10px`, `--radius-lg: 12px`,
  `--radius-xl: 14px`, `--radius-2xl: 16px`
- Quy tắc: **80% component không dùng radius > 16px**. Pill (999px) CHỈ cho
  badge/status/tag/filter — không cho button, card, row.

### Shadow — giảm phụ thuộc
- Chỉ 2 mức: `0 1px 2px rgba(17,24,39,.05)` và `0 8px 24px rgba(17,24,39,.08)`.
- Tạo phân cấp bằng **surface + border**, không bằng 10 loại shadow.

### Typography
- Giữ **Be Vietnam Pro** (đã đúng hướng), thêm nhịp mạnh:
  display 28–32/1.1/800 · section 18–20/1.25/700 · body 14–15/1.5/400 ·
  caption 12–13/500 · **score 20–40/800, letter-spacing −0.04em** (số điểm phải
  "giống game", không dùng Orbitron cho chữ thường).
- Icon: chỉ Lucide; **bỏ icon nếu chữ đã đủ rõ** (icon tăng nhận diện, không lấp chỗ).

## 4. Nguyên tắc chống AI-slop (mới, đưa vào quy tắc review)

1. Không phải element nào cũng cần container — **một mức containment thôi**.
2. Gradient chỉ khi có semantic, không bao giờ "cho đẹp".
3. Pill chỉ cho status/tag/filter.
4. Icon chỉ khi tăng recognition.
5. Màu phải có semantic — không dùng 4 màu để tạo variety.
6. **Mỗi màn hình phải có một visual idea.**
7. Brand test: bỏ logo đi vẫn phải nhận ra đây là app thi đua lớp THPT Việt Nam.
8. Personality đến từ **dữ liệu thật** ("Tổ 1 đang dẫn +8 hôm nay",
   "Tổ 1 máu chưa mọi người?"), không từ decoration.

## 5. Cấu trúc lại từng trang

### 5.1 App shell (chung)
- Nav desktop: **Tổng quan → Bảng lớp (feed) → Thi đua → Nhiệm vụ → Thành viên →
  Công cụ** (theo mental model học sinh: việc cần làm trước, taxonomy phần mềm sau).
- Header mobile: bỏ nhãn route "Tổng quan" (bottom nav đã nói) → chỉ logo `12A6`
  + avatar/QB. Icon 24px nhưng hit area ≥44px.
- Bottom nav: 5 đích, label 11–12px, active = pill xanh rất nhẹ, **còn lại phẳng,
  off-white, border-top 1px** — không glassmorphism/floating/gradient.
- **Bắt buộc**: content cuối không bị bottom nav che →
  `padding-bottom: calc(72px + env(safe-area-inset-bottom))`.

### 5.2 Dashboard (mobile-first, desktop theo sau)
Cấu trúc mới (thứ tự ưu tiên P0→P4):

1. **Hero "trạng thái lớp" ~280–320px** (cắt từ ~500px):
   `12A6 · Thứ Ba 06/10` → greeting nhỏ → **"12A6 đang dẫn đầu thi đua tuần này"**
   → 1 dòng status compact `36 bạn · 4 việc · #1 Tổ 1`.
   **Bỏ 4 metric card 2×2**, bỏ pill "Học sinh 12A6", bỏ "Kho công cụ — Sẵn sàng".
2. **Leaderboard = hero content**, hiện ngay:
   hàng #1 có treatment riêng (chữ lớn, số 20–24/800, accent lime tiết chế),
   có delta `↑ +8 hôm nay`. Row tappable → xem chi tiết thành tích tổ.
   Label mơ hồ "Đầu trường →" → "Xem chi tiết →".
3. **Việc cần chốt** — chỉ 3 việc, trạng thái nhận ra 0,5s (🔴 quá hạn / 🟡 hôm nay /
   🟢 đã xong — dùng dot màu + chữ, KHÔNG emoji làm icon), reward `+8đ` nổi bật
   hơn metadata. Microcopy: "Việc cần chốt", "Chốt sớm — lấy điểm cho tổ".
4. **Bảng tin** — flatten, không card trong card: divider + timestamp.
5. Microcopy tự nhiên: "Tổ nào đang dẫn?", "Bảng điểm vừa cập nhật".

QB → thành **coach thật sự**: `Tối nay Tổ 1 đang dẫn 24 điểm. Tổ 3 chỉ còn 1
nhiệm vụ để vượt Tổ 4` — hoặc bỏ hoàn toàn nếu không làm được utility thật.

### 5.3 Feed ("Bảng lớp")
- **Wall + divider**, không phải bộ sưu tập card: bỏ nền card, bỏ shadow, radius
  image 8px, tách bằng `1px #DDD8CE`.
- Cột nội dung 720–760px (hiện ~674 quá hẹp). Sidebar CHỈ nếu có dữ liệu thật
  trả lời "lớp mình hôm nay thế nào" — không thì bỏ.
- **Composer compact**:ollapsed ~64–76px, placeholder `Có gì mới ở 12A6?` —
  click mới expand. Bỏ "Chia sẻ điều gì đó với lớp?".
- Post: avatar 40px · tên 14–15/600 · badge `GIÁO VIÊN` nhỏ (không pill tròn) ·
  timestamp theo ngữ cảnh (<1h: "8 phút"; hôm qua: "Hôm qua, 18:40"; cũ: "05/10 · 18:40").
- Ảnh = **first-class content**: full width theo cột, 1 ảnh full / 2–3 ảnh grid /
  4+ grid, không crop cứng 16:9, lightbox + ESC. Không carousel mặc định.
- Bình luận **inline thread** — không modal, không chuyển trang, không card comment.
- Ghim: nhãn `GHIM TRÊN BẢNG`, marker lime tiết chế.
- Rhythm: bài dài/ngắn/có ảnh xen kẽ — **không normalize mọi post cùng height**.
- Like: `♡ 3 → ♥ 4`, transition 120–180ms, không confetti. Share: **không thêm**
  nếu không có nơi để share → menu `···` với Sao chép link / Ghim / Xóa / Báo cáo.
- Empty state có voice: `Bảng còn trống. Có gì hay thì đăng lên cho cả lớp xem nhé.`

### 5.4 Voice (microcopy)
5 từ: **thân — thật — nhanh — có chút nghịch — không cố trẻ**.
- ✅ "Tổ 1 máu chưa mọi người?", "Việc cần chốt 🔥"(chỉ text, icon Lucide),
  "Chốt sớm — lấy điểm cho tổ."
- ❌ "Hãy cùng tổ 1 nỗ lực để đạt vị trí cao nhất!", "Helloooo 12A6 😎",
  "Bạn muốn chia sẻ điều gì với cộng đồng lớp?"

## 6. Trạng thái mood theo màn hình (design bible §27)
Dashboard: calm & informative · Leaderboard: energetic · Achievement: celebratory ·
Feed: comfortable & lively · Quản lý (teacher): efficient & professional.

## 7. Thứ tự thực hiện

- [ ] A. Tokens + gỡ gradient/radius/pill toàn cục (`globals.css` + shell)
- [ ] B. App shell: nav, header, bottom nav (kèm fix che content)
- [ ] C. Dashboard mới (mobile trước, desktop theo)
- [ ] D. Feed mới (wall, composer compact, ảnh, comment inline)
- [ ] E. Các trang còn lại khớp token (competition, tasks, members, class, apps,
      profile, help, messages)
- [ ] F. Hệ thống thành tích (Achievement) + trang /achievements
- [ ] G. Dashboard theo vai trò (teacher / monitor / student / team leader)
- [ ] H. Polish: motion, empty/loading/error, accessibility, mobile
- [ ] I. Verify: `npm run build` + `typecheck` + `lint`, screenshot 2 cỡ,
      audit lại bằng AI, sửa theo kết quả
- [ ] J. Deploy Vercel
