# A6Class UI v2 — "Bảng Đen & Phấn" (Chalkboard)

> Đây là **định hướng UI mới hoàn toàn** thay cho phong cách "giấy" hiện tại.
> Đọc kỹ phần 1–7 (tokens, layout, chữ) trước khi đụng code. Phần 8 là lộ trình
> tự làm từng bước. Làm đúng token → cả web đổi màu đồng bộ mà không phải sửa lại layout.

---

## 1. Ý tưởng (Art direction)

**Concept: "Lớp học về đêm"** — khi cả lớp mở app là cả lớp vây quanh **bảng đen**.
- Nền **bảng đen ấm** (xanh đen/charcoal, không cho đen tinh).
- Chữ = **phấn trắng ấm** (ngả vàng nhẹ, không trắng tinh).
- Đúng **1 màu "phấn" chủ đạo**: **vàng phấn `#E8B23C`** cho mọi hành động chính.
- Còn lại: phấn xanh lá (thành công), phấn đỏ (nguy hiểm), phấn xanh dương (thông tin), dùng rất kiệm.
- Cảm giác: **nghiêm túc + ở trường + nhiệt thành + thuộc về một lớp**. Không phải dark-mode
  "tech-ish" lạnh; là không gian bảng đen ấm áp. Không gradient, không bóng đổ, không blur, không emoji.

**Vì sao khác AI-slop:** dark theme AI luôn là `#0B0F19` navy + tím + gradient. Bảng đen thì
**xanh-đen ấm + phấn vàng + chữ phấn** — bộ màu không nằm trong bất kỳ template nào, và việc
giữ PHẲNG tuyệt đối (bảng đen không có bóng) là điểm dễ nhận diện.

---

## 2. Design tokens (bảng chính — đổi trong `src/app/globals.css`)

### 2.1 Màu

> **Bản v2.1 (đã sửa sau review màu):** sai lầm bản đầu là dùng nền **xanh-đen lạnh** (`#171A19`
> ánh lục) + phấn vàng rực ấm → ngả thành màu "olive-quân đội" xỉn; và màu trạng thái neon
> (`#6FCB7A/#EF7474/#7FB2FF`) quá digital phá vẻ "phấn viết tay". Nguyên tắc sửa: nền
> **charcoal nâu ấm** (không ánh lạnh), phấn vàng **sáng óng** (không "mù tạt"), mọi màu phụ
> = **pastel phấn ấm, giảm bão hòa**.

| Token | Hex | Dùng cho |
|---|---|---|
| `--color-bg` | `#1A1714` | Nền trang (bảng đen espresso ấm) |
| `--color-surface` | `#221E1A` | Card/panel hạng 1 |
| `--color-surface-2` | `#2A2621` | Card nhấn, group nhập liệu, autocomplete |
| `--color-surface-hover` | `#2F2A24` | Hover lên surface |
| `--color-border` | `#3D3831` | Viền card / input |
| `--color-border-strong` | `#544E44` | Viền key (next/primary) |
| `--color-text` | `#F7F2E6` | Chữ chính (kem phấn) |
| `--color-text-secondary` | `#D6CFBE` | Chữ phụ / mô tả |
| `--color-text-muted` | `#A0988C` | Chữ mờ / metadata |
| `--color-primary` | `#EDB72E` | **Phấn vàng óng** — nút chính, link, active tab |
| `--color-primary-hover` | `#F5C943` | Hover của primary |
| `--color-primary-ink` | `#201704` | Chữ TRÊN nút phấn vàng (tối) |
| `--color-success` | `#9FCE8D` | Phấn xanh cây (pastel) — đạt / +điểm |
| `--color-danger` | `#E58A7B` | Phấn đỏ san hô (pastel) — quá hạn / trừ điểm |
| `--color-warning` | `#EDB72E` | Cảnh báo (dùng chung phấn vàng) |
| `--color-info` | `#93B8DE` | Phấn xanh trời (pastel) — thông tin |
| `--color-violet` | `#B4A5D8` | Phấn tím nhạt (pastel) — nhãn phụ, kiệm |
| `--color-amber` | `#EDB72E` | #1 / huy chương |

Độ tương phản (kiểm tra bằng DevTools accessibility):
- `#F7F2E6` trên `#1A1714` → **14.2:1** ✓
- `#A0988C` trên `#1A1714` → **4.6:1** ✓ (đủ cho text nhỏ)
- `#EDB72E` trên `#1A1714` → **9.4:1** ✓
- Chữ đen `#201704` trên `#EDB72E` → **10.9:1** ✓

**Màu tổ (team color):** bản pastel ấm tương ứng cho nền tối:
Tổ 1 `#F4917E`, Tổ 2 `#7FA7E6`, Tổ 3 `#8ECB98`, Tổ 4 `#F1C25C` (chấm tròn = màu tổ).

**Luật phối màu:** không bao giờ dùng màu neon/100%-saturation trên nền bảng đen. Mọi accent
đi qua bộ lọc "phấn": giảm bão hòa (chroma) + thiên ấm nếu là tông đỏ/vàng, thiên trầm nếu tông xanh.

### 2.2 Chữ (typography)

Giữ font hiện có nếu nó là **Be Vietnam Pro** (hỗ trợ tiếng Việt đầy đủ). Nếu chưa có, đổi sang:
`font-family: "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif;`

| Vai trò | Cỡ | Weight | Khoảng chữ | Ghi chú |
|---|---|---|---|---|
| Display (h1 trang) | 24px (mobile) / 28px (desktop) | 800 | -0.02em | Không VO hoa cục bộ |
| Heading section (h2) | 16px | 800 | 0 | Kèm icon 16px |
| Sub (p phụ) | 14px | 400 | 0 | |
| Body | 14–15px | 400/500 | 0 | |
| Label (nhãn phấn) | 11px | 700 | **0.12em UPPERCASE** | Chữ viết hoa + giãn = "chữ phấn viết hoa" trên bảng |
| Number | 14–28px | 700/800 | 0 | **luôn `font-variant-numeric: tabular-nums`** (điểm, hạng) |
| Caption | 11–12px | 400/500 | 0 | timestamp, metadata |

Quy tắc: **không viết hoa cả câu**. Chỉ UPPERCASE cho label ngắn. Tiếng Việt có dấu vẫn UPPERCASE được (đẹp: "NHIỆM VỤ HÔM NAY").

### 2.3 Thang khoảng cách, bo góc, viền, elevation

- Spacing base **4px**: 4/8/12/16/20/24/32/40. Padding trang: **16px mobile / 24px desktop**. Gap chuẩn 16, giữa section 24.
- Bo góc: card **12px** (`rounded-xl`), panel nhỏ **10px**, nút **10px**, badge **pill**, input **10px**, avatar tròn.
  **Không bo hết mọi thứ `rounded-2xl/3xl`** — để vẻ "đồ bảng" ít bo tròn hơn giấy.
- Viền: `1px solid var(--color-border)`. Card nổi hơn = `border-strong` HOẶC `surface-2` nền — **không shadow**.
- Elevation bằng: nền + viền. Cao hơn nữa (modal/dropdown): `surface-2` + viền `border-strong` + 1px highlight đỉnh `rgba(255,255,255,0.05)` inset. **Không dùng box-shadow to**. (Theo dõi: các element có class `ring-1 ring-border` hiện đang KHÔNG hiển thị — hãy thay toàn bộ bằng `border border-border`. Grep: `rg "ring-1 ring-border"` bằng 0.)

### 2.4 Motion tokens

| Nhịp | Thời gian | Easing | Dùng |
|---|---|---|---|
| fast | 140ms | `cubic-bezier(.25,.1,.25,1)` | hover, focus, press |
| normal | 220ms | `cubic-bezier(.2,.8,.2,1)` | switch tab, panel, sheet |
| emphasis | 340ms | `cubic-bezier(.16,1,.3,1)` | modal, page enter |
| celebrate | 600–900ms | spring nhẹ | achievement, count-up |

Respect `@media (prefers-reduced-motion: reduce)`: thay mọi chuyển động chuyển vị bằng opacity 120ms.

### 2.5 Z-index & breakpoints

- breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536` (giữ nguyên Tailwind mặc định).
- z: nav sticky `40`, sheet/nav mobile `50`, modal backdrop `60`/modal `70`, toast `80`.
- **Mobile-first: thiết kế trước ở 390×844, sau mới desktop ≥1280.**

---

## 3. Không gian "bảng đen" (board affordances)

Một số chi tiết LÀM nên vẻ bảng đen, áp dụng từng cái một (đừng làm hết):

1. **Đường kẻ bảng (chỉ nền):** hero/large blank area có thể đặt
   `background-image: repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,0.035) 23px, rgba(255,255,255,0.035) 24px);`
   → gợi giấy/bảng kẻ ô mà KHÔNG phải gradient "flash" (độ mờ cực thấp, tĩnh, không blur). Chỉ ở 1 vùng/trang, không lặp nơi khác.
2. **Nhãn phấn:** label UPPERCASE giãn chữ = chữ phấn. Dùng cho section header, nhãn trường, kicker ở hero.
3. **Số phấn:** mọi con số điểm/hạng/thời gian dùng `tabular-nums`.
4. **"Flash" focus:** `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` — như dòng phấn gạch chân.
5. **Điểm nhấn vàng duy nhất:** chỉ element quan trọng nhất/lần view được dùng màu primary (nút chính, tổ #1, dòng highlight). Không viền vàng quanh mọi thứ.
6. Không granite/noise/glow. Phẳng là "bảng".

---

## 4. Component spec (component chuẩn — sửa 1 nơi, dùng mọi nơi)

> Hiện app chưa có thư viện component theo chuẩn; để tự làm nhanh, tạo `src/components/ui/`
> với các component dưới. Tên và props gợi ý theo chuẩn shadcn/Base UI đang nhập.

### 4.1 Button
- Kích thước: `h-9 px-4 text-sm` (điều), `h-10 px-5` (lớn trên hero), icon 16px.
- **Primary**: `bg-primary text-primary-ink hover:bg-primary-hover` + press: `scale-[0.98]`.
- **Secondary**: `border border-border text-text hover:bg-surface-hover`.
- **Ghost**: `text-text-secondary hover:text-text hover:bg-surface-hover`.
- **Danger**: `bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20`.
- Loading: giữ width, icon spin + `disabled`. Không đổi kích thước.

### 4.2 Card / Panel
- Chỉ dùng khi *group* nhiều thứ cần khu biệt. Không bọc mọi thứ trong card.
- `bg-surface border border-border rounded-xl p-4 sm:p-5`, `space-y-4` bên trong.
- Header card: label phấn + action link phải (nút ghost).

### 4.3 Input / Select / Textarea
- `h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm text-text placeholder:text-text-muted`.
- Focus: `border-strong` + `outline 2px primary/opacity-30`. Lỗi: `border-danger` + message 12px danger.
- Input có icon: icon 16px `text-text-muted` trái, `pl-9`.

### 4.4 Badge
- Base: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold`.
- Tones: success (`bg-success/12 text-success`), danger (`bg-danger/12 text-danger`),
  info (`bg-info/12 text-info`), primary (`bg-primary/12 text-primary`), muted (`bg-surface-2 text-text-muted border border-border`).
- Đối màu sắc nhẹ bằng `/12` alpha để nền tối vẫn nổi.

### 4.5 Tabs
- Định hướng: `flex items-center justify-center` + label phấn 12px UPPERCASE; active = `text-primary` + underline 2px `bg-primary` (dưới), inactive `text-muted`. **Phẳng, không pill.**

### 4.6 Table (thi đua, thành viên)
- Header: `text-[11px] uppercase tracking-wide text-muted`, không nền.
- Row: `border-t border-border`, hover `bg-surface-hover`.
- Số: `tabular-nums text-right`. Cột quan trọng (Ròng): `font-extrabold`.
- Trên mobile: đừng nhồi — thi kết `overflow-x-auto` hoặc đổi card list (part 7, Thi đua).

### 4.7 Empty state (THIẾT KẾ SẴN, không để trống)
Cấu trúc: `py-10 text-center` → icon Lucide 32px `text-muted` trong vòng dashed `border-dashed border-border rounded-full p-3` → title 14px 700 → desc 13px muted → **1 nút primary** duy nhất.
Copy mặc định: **"Bảng trống — bắt đầu viết thôi."** (thay theo trang).

### 4.8 Skeleton loading
Giống layout thật: block `bg-surface-2 animate-pulse rounded` đúng vị trí text/card. Không spinner trừ opera phức tạp.

### 4.9 Toast
Top-phải desktop / bottom-above-nav mobile. `bg-surface-2 border border-border` + icon trái (success=success, error=danger...), tự ẩn 3.5s, `slide-up` 220ms. Không dùng alert().

### 4.10 Modal/Confirm
Backdrop `bg-black/60 backdrop-blur-[2px]` → panel `bg-surface-2 border-border-strong max-w-sm rounded-xl p-5`. Destructive: nút danger + ghost "Huỷ". Anim: scale .98→1 + fade 220ms.

### 4.11 Avatar
Circle `size-8/10`, nền `surface-2`, chữ initials `text-xs font-bold`, màu theo tổ (border 2px team-color). 

### 4.12 Icon
Chỉ dùng **Lucide React** (đang dùng). Mọi icon `aria-hidden`, kích thước 16–20px, strokeWidth 2 — đồng bộ.

---

## 5. Layout

### 5.1 Khung
- Desktop: header sticky `h-14` (logo + nav tabs ngang + avatar/user menu) + main `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6`.
- Mobile: header `h-12` (logo + nút quét + user menu) + **BottomNav cố định** 5 mục: Tổng quan, Bảng lớp, Thi đua, Nhiệm vụ, Công cụ. Main padding đáy ≥ `88px`.
- Header nền = `bg-bg/95` + `border-b border-border`. KHÔNG backdrop-blur nặng.
- Trang lớn desktop có thể route ở `max-w-6xl`.

### 5.2 Grid
- 1 cột mobile. Từ `lg`: 2 cột chính-phụ; từ `xl`: 3 cột max 12.
- Cột phụ desktop (vd Bảng lớp): 300px, có `position:sticky; top:72px`, chỉ hiện ≥xl.
- Khoảng cách cột: `gap-6`. Đều, `items-start`.

---

## 6. Page-by-page (thứ tự ưu tiên tự làm)

### 6.1 Login / Register
- Nền: toàn màn hình `--color-bg` + `board-lines` nhẹ ở hero trái (desktop) / đỉnh (mobile).
- Trái (desktop ≥lg): brand + slogan + 3 "bằng chứng" nhỏ (icon + 1 dòng: "Chấm điểm theo tuần", "Bảng phấn của lớp bạn", "Cả lớp một nhà"). Phải: form card surface, `max-w-md`.
- Nút submit: **phấn vàng full-width h-11**, text màu `primary-ink`.
- Link đổi đăng nhập/đăng ký: text-primary ghost. Lỗi: banner danger.
- Logo: giữ bản hiện tại, đổi để vừa bảng đen (chữ phấn trắng + icon vàng).

### 6.2 Tổng quan (Dashboard) — học sinh
Thứ tự (theo DESIGN-REDESIGN §5.2, đổi màu):
1. **Hero (P0):** nền `surface` viền border, có `board-lines` mờ. Kicker label phấn `LỚP 12A6 · Thứ Năm 08/10`. Greeting 14px `text-secondary`. **h1** 24–28 "Tổ 1 đang dẫn đầu" HOẶC "Chưa có tổ nào để đua". Stats phải: Điểm của bạn + Hạng cá nhân + Tổ của bạn (số = `tabular-nums`, nhãn = label phấn 11px).
2. **Lối tắt:** 3 nút theo role (primary 1 + secondary 2) — đã có CTAs.
3. **Leaderboard (P1):** 3 tổ top, mỗi tổ 1 row: huy hiệu hạng (vàng = #1) + tên tổ + `avg đ/bạn` tabular. Row #1 có `border-primary/40`. Kèm bar progress mỏng màu tổ.
4. **Việc cần chốt (P2):** max 3 việc, dot màu trạng thái (danger=hết hạn, amber=hôm nay, success=xong, muted=còn X ngày) + tên + `+5đ` badge primary. **Empty state:** copy "Lớp chưa có việc nào — giao việc đầu tiên" + nút ghost "Xem tất cả việc".
5. **Bảng tin ghim (P4):** 3–5 TB, Pin icon, title + nội dung 2 dòng + time muted. Empty: 1 dòng muted.

### 6.3 Bảng lớp (Feed)
- Wall **740px giữ nguyên** (spec §5.3). Desktop ≥xl thêm cột phụ 300px: **Thông báo ghim** + **Sự kiện** (nếu có) + **Đi nhanh** (3 link).
- Composer: `surface` card có avatar + placeholder "Cả lớp có gì mới?" + nút đăng phấn vàng. Focus: outline primary.
- Bài đăng: avatar + tên + role badge + time `text-muted 11px`; nội dung 15px line-relaxed; footer: like/comment count ghost; bài ghim có badge `Ghim`.
- Phân trang/infinite: placeholder "Xem thêm" ghost — mới có thể chưa cần.

### 6.4 Thi đua (Competition) — leaderboard
- Header: h1 + label kỳ + chip "Còn X ngày" + **nút MỚI: nút pill "Tuần này/Cả năm" LÀ dạng tabs-chuyển scope** (đã có). Thêm dòng ngữ cảnh: "Điểm trong kỳ {name} — tổng tích lũy xem mục Cả năm và Trang chủ".
- **Zero-state (kỳ chưa nhập điểm):** banner `bg-surface-2 border border-border` icon + chữ rõ. KHÔNG hiện huy chương #1, KHÔNG xếp "Yếu". Đã có — giữ.
- Bảng tổ: rank + tên + `avg đ/bạn` tabular + bar mỏng. #1: viền primary/40.
- Bảng cá nhân: 6 cột (#, HS, Cộng, Trừ, Ròng, Xếp loại), **reorder animation FLIP khi scope đổi** (nhẹ, 220ms translate).
- Mobile: bảng cá nhân đổi thành **card list**: avatar + tên + "+X / −Y / Zđ" + tier, để `overflow-x` không cần.

### 6.5 Nhiệm vụ (Tasks) / Thành viên (Members) / Hồ sơ / Thành tích / Messages
- Đều theo: label phấn section, card 12px, empty state có nút, số tabular.
- **Thành tích:** khi unlock, hiện toast kiểu achievement: reveal scale 600ms + vòng glow vàng (1 lần), giữ 4s. Đừng confetti mỗi giây.
- **Messages:** bubble = `surface-2` + chữ text; bubble của mình = `primary/15` + viền `primary/30`. Timestamp muted. Input dạng 4.3.

---

## 7. Motion (làm có lý do, không làm cho đẹp)

| Thao tác | Motion |
|---|---|
| Hover nút | Đổi bg 140ms (không nate chỗ khác) |
| Press nút | `scale .98` 100ms |
| Chuyển tab/scope | fade+bảng đi 2ms 220ms; hàng xếp hạng reorder bằng translate 220ms (không re-render giật) |
| Page enter | fade+slide 8px 340ms (đã có AnimatedPage) |
| Modal | backdrop fade 200ms + panel scale .98→1 220ms |
| Toast | slide-up 220ms, tự ẩn |
| Count-up điểm | 600ms (dừng đúng số thật — không animate số ảo) |
| Reduced motion | mọi việc trên → opacity 120ms |

**LUẬT DỮ LIỆU (bất khả xâm phạm):** KHÔNG BAO GIỜ bịa / tô điểm số liệu để UI đẹp.
Không có dữ liệu → empty state thiết kế sẵn (4.7). Số hiển thị = số query ra. (Lỗi này đã từng khiến web "đầy dữ liệu ảo".)

---

## 8. Lộ trình tự làm (từng bước)

1. **Tokens:** trong `src/app/globals.css`, thay `--color-*` theo bảng 2.1 → cả web đổi nền/chữ/nút. Chạy `npm run dev`, vào từng trang, sửa màu cục bộ lệch (hard-coded `#2563EB`, `#F5F1E8`...).
2. **Font + nhãn phấn:** thêm be-vietnam-pro nếu chưa; soát label: lớp `uppercase tracking-[0.12em] text-[11px] font-bold` tại section header.
3. **Border fix:** `rg -n "ring-1" src` → thay `ring-1 ring-border`→`border border-border` mọi chỗ còn sót.
4. **Component UI:** dựng `src/components/ui/{button,card,input,badge,empty-state,toast,modal}.tsx` theo phần 4, thay dần trong từng trang (bắt đầu dashboard → feed → competition).
5. **Empty states:** mỗi trang có ít nhất 1 empty state xịn (4.7) — dashboard, feed, tasks, competition, messages, chat.
6. **Motion:** thêm FLIP reorder leaderboard (6.4) + press/hover. Respect reduced motion.
7. **Mobile pass:** 390px — bottom nav 5 mục, touch ≥44px, bảng cá nhân → card list.
8. **QA:** `npm run lint`, `npm run typecheck`, probe overflow @1280/@1440, kiểm tra contrast từng cặp màu 2.1, chụp 16 trang, tự review theo phần 9 checklist.

## 9. Checklist review trước khi coi là xong
- [ ] Không gradient / shadow to / blur / glow / emoji
- [ ] Đúng 1 màu phấn chủ đạo/lần view
- [ ] Mọi số là `tabular-nums`; mọi label phấn UPPERCASE
- [ ] Số liệu = query thật, zero-data có empty state thiết kế
- [ ] Có skeleton cho loading; modal/toast thay alert
- [ ] Mobile 390px không tràn, touch ≥44px
- [ ] Reduced-motion hoạt động
- [ ] Keyboard: focus ring phấn rõ
- [ ] Nhìn vào 1 màn hình bất kỳ không thấy "đây là AI làm"