# A6Class UI v3 — "Pop Rực Rỡ Gen-Z" (Sticker Pop)

> Thay **hoàn toàn** theme Bảng Đen v2 bằng giao diện sticker-pop sáng, Gen-Z.
> Đợt 1: 4 trang chính (login, dashboard, feed, competition) + shell tối thiểu.
> Các trang còn lại ăn token mới tự động, polish sau.

## 1. Ý tưởng

**"Sổ sticker của lớp"** — mỗi màn hình như một trang sổ dán sticker: khối màu
tươi, viền mực dày, bóng đổ lệch cứng, badge xoay nhẹ. Vui nhưng gọn: **màu chỉ
nằm trên chip/badge/hero**, chữ và nền giữ sạch để đọc tốt. Không gradient,
không blur, không glass, không emoji (icon = Lucide).

## 2. Tokens (`globals.css` — flip từ v2)

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg` | `#F5F7FA` | Nền trang (trắng sáng hiện đại) |
| `--surface` | `#FFFFFF` | Card |
| `--surface-hover` | `#EBEFF4` | Hover |
| `--surface-elevated` / `surface-2` | `#E7EDF3` | Panel nhấn, input fill |
| `--border` | `#E2E8F0` | Viền mảnh thường |
| `--border-strong` | `#1E1B16` | **Viền mực** (sticker, input focus) |
| `--text` | `#1E1B16` | Chữ chính (mực nâu-đen) |
| `--text-secondary` | `#4E5866` | Chữ phụ |
| `--text-muted` | `#6B7480` | Mờ (≥4.9:1 trên nền sáng) |
| `--primary` | `#1E1B16` | **Nút chính = mực** (chữ kem, 15:1) |
| `--primary-hover` | `#3A342A` | Hover nút mực |
| `--primary-ink` (fg) | `#FFF6E9` | Chữ trên nút mực |
| `--primary-light` | `rgba(30,27,22,.07)` | Nền active nhẹ |
| `--accent` (pink) | `#FF5C8A` | Điểm nhấn #1 (CTA phụ, sticker) |
| `--accent-ink` | `#C22755` | Chữ hồng đọc được trên kem (≈5:1) |
| `--gold` / amber | `#FFC531` | Huy chương, sao, highlight |
| `--amber` (text) | `#9A6200` | Chữ vàng đậm trên kem |
| `--success` | `#1F9D55` | Xanh lá đậm (chữ/nền-α) |
| `--danger` | `#D92D20` | Đỏ đậm |
| `--warning` | `#B54708` | Cam đậm |
| `--info` / sky | `#175CD3` | Xanh dương đậm |
| `--violet` | `#6941C6` | Tím đậm |
| `--secondary` | `#FFE3EC` | Nền hồng nhạt (badge thứ cấp) |

Tương phản: mực trên kem ≈ 15:1; hồng `#C22755` ≈ 5.4:1; `#968A76` ≈ 4.6:1;
trắng trên hồng `#FF5C8A` chỉ 3.3:1 → **chip hồng dùng chữ mực, không chữ trắng**.

Màu sticker fill (chỉ làm nền chip/badge, chữ trên đó = mực):
pink `#FFC9D9`, yellow `#FFE08A`, green `#B9E8C9`, blue `#BCD6FF`, purple `#D9C8FF`, orange `#FFCFA8`.

## 3. Sticker system (class dùng chung, thêm vào `globals.css`)

- `.pop-card`: `bg-surface border-2 border-ink rounded-[20px] shadow-[4px_4px_0_var(--ink)]`
  (ink = `#1E1B16`). Chỉ dùng cho hero/highlight — card thường dùng
  `bg-surface border border-border rounded-2xl` + bóng mềm `0 8px 24px rgba(120,90,30,.10)`.
- `.sticker`: pill, `border-2 border-ink`, fill pastel (§2), chữ mực 11px 800
  uppercase, padding `3px 10px`. Biến thể xoay: `.sticker-tilt { rotate: -2deg }`.
- Nút chính: `bg-primary text-[#FFF6E9] rounded-2xl border-2 border-ink
  shadow-[3px_3px_0_#FF5C8A]` + press `translate(2px,2px) shadow-none`.
  (Dùng utility có sẵn của Button variant default — đổi trong `buttonVariants`.)
- Rank medal: vòng tròn 28px, #1 = fill `#FFC531`, #2 = `#E8E2D4`, #3 = `#F0B27A`,
  chữ mực 800. Không dùng emoji huy chương.
- Nhãn section: 12px 800 uppercase tracking + icon 16px màu accent.
- Số: `tabular-nums`, 800/900.

## 4. Từng trang (đợt 1)

### Login (`auth-shell` + `login-form`)
- Khung: 2 cột desktop — trái panel hồng `#FF5C8A` chữ kem: logo, slogan lớn
  800, 3 sticker bay (xoay ±3°: "+5đ", "#1 tuần", "12A6"); phải form card trắng
  sticker. Mobile: panel gọn trên, form dưới.
- Input: fill `#FFFDF8`, viền 2px `border-border`, focus → `border-ink` +
  `shadow-[3px_3px_0_#FFC531]`. Nút submit: mực + bóng hồng (spec §3).
- Logo trên nền sáng: chữ "A6" → `currentColor` (kế thừa màu chữ cha), "CLASS"
  → hồng `#FF5C8A`, mark giữ gradient vàng, dot vàng.

### Dashboard
- Hero: khối vàng `#FFC531` viền mực bóng lệch + sticker trắng xoay ("Hạng 3",
  "24đ", "Tổ 2"); greeting mực 900.
- Leaderboard: hàng sticker trắng — medal tròn (§3) + tên + thanh progress màu
  tổ + số tabular. Hàng #1 viền mực 2px.
- Task: dot trạng thái + chip điểm sticker (`+5đ` vàng / `−3đ` hồng / `xong` xanh).
- Empty state: icon Lucide trong vòng sticker đứt nét + 1 nút mực.

### Feed
- Composer: card sticker trắng, avatar viền mực 2px, nút Đăng = mực.
- Post: card trắng viền mảnh; avatar viền màu tổ 2px; badge Ghim = sticker vàng
  xoay -2°; like/comment ghost mực.
- Aside (≥xl): card "Ghim" nền vàng nhạt + "Đi nhanh" sticker links.

### Competition
- Tabs Tuần/Cả năm: segmented sticker (active = mực fill chữ kem).
- Champion #1: panel hồng `#FF5C8A` chữ kem + cúp vàng lớn + số tabular trắng.
  (Trắng trên hồng 3.3:1 — chỉ dùng cho số/to, chữ nhỏ dùng mực trên chip vàng.)
- Bảng tổ/cá nhân: giữ table desktop (header uppercase 11px), rank chip medal;
  mobile → hàng sticker.
- Zero-state: banner kem + icon + nút mực "Tạo kỳ thi đua".

## 5. Shell (tối thiểu cho đợt 1)

- `BottomNav`: active = pill mực (`bg-primary text-[#FFF6E9]`), inactive muted.
- `nav-tabs` (desktop): active = sticker viền mực fill vàng nhạt.
- Header: `bg-[#FFF6E9]/95 border-b border-border`. Không đổi cấu trúc.
- `Button` default → mực + bóng hồng (§3). `Badge` default → sticker vàng
  (fill `#FFE08A`, chữ mực, viền mực). Các variant khác giữ nguyên ý nghĩa.

## 6. Luật

- Màu tươi CHỈ trên nền chip/hero; chữ body luôn mực/xám ấm.
- Chip màu: chữ mực (không chữ trắng trên nền tươi, trừ số lớn trên hồng).
- Không gradient mới; logo/mascot giữ nguyên shape, chỉ đổi màu chữ/logo.
- Số liệu thật + empty state có icon (giữ luật DATA từ v2).
