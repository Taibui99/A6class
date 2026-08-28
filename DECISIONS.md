# A6Class — Decisions

> Ghi lại các quyết định kiến trúc quan trọng.

## 2026-08-27: Tech Stack
- **Frontend:** Next.js 16 App Router
- **Backend:** Neon Postgres + Neon Auth (Managed Better Auth)
- **ORM:** Prisma
- **UI:** shadcn/ui + Tailwind CSS v4
- **Font:** Be Vietnam Pro
- **Icons:** Lucide React
- **Deploy:** Vercel
- **Reason:** Supabase chosen over Firebase because PostgreSQL handles relational data naturally, RLS is more mature for multi-role permissions, and user has experience from EduTest. (→ đã pivot sang Neon, xem bên dưới)

## 2026-08-27: Design Philosophy
- Modern, clean, professional — not childish, not enterprise, not AI-generated
- Anti-AI-slop rules from classos-design-bible skill
- Role-based UX (teacher ≠ student ≠ team leader)
- Mobile-first (students use phones)
- Gamification without childishness

## 2026-08-27: Database
- 30+ tables with full relations
- Denormalized totalScore on Team for fast leaderboard queries
- CompetitionPeriod for time-bounded competitions
- PointTransaction as source of truth for scores

## 2026-08-27: Project Location
- Repository: https://github.com/Taibui99/A6class.git
- Local: D:\A6Class
- Skills: C:\Users\PC\.agents\skills\ (49 skills installed)

## 2026-08-28: Pivot Supabase → Neon
- **Neon Postgres** thay PostgreSQL/Supabase (dedicated DB): kết nối qua `neon link` (project `snowy-fire-56923018`, org `org-snowy-sky-33509154`); app dùng **pooled** `DATABASE_URL`, migrations dùng **direct** `DATABASE_URL_UNPOOLED` (`directUrl` trong datasource). Migration `init` đã áp (25 bảng).
- **Neon Auth (Managed Better Auth)** thay Supabase Auth + Better Auth self-host: config-as-code `neon.ts` (auth: true) + `npx neon deploy`; SDK `@neondatabase/auth`. Cookie `__Secure-neon-auth.session_token` (Secure, HttpOnly, SameSite=lax, 7 ngày). Trusted domain `http://localhost:3000` đã thêm; **bắt buộc `Origin header`** khi gọi server API (trình duyệt tự gửi; khi test bằng HTTP client phải set Origin hoặc báo lỗi `bad_oauth_callback 400`).
- **Bỏ hoàn toàn Supabase** — `src/lib/supabase/` đã xoá, `@supabase/ssr` + `@supabase/supabase-js` đã gỡ.
- **Auth mapping:** auth user id ≠ Prisma User id → `getCurrentUser` match theo **email**, trả `id` = Prisma User id (dashboard query theo Prisma pk). `signUp` upsert `prisma.user` theo email kèm `role`.
- **Build:** `npm run lint` / `typecheck` / `build` xanh; routes `/login`.. ƒ dynamic (kèm mọi route bảo vệ trong proxy).

## 2026-08-27 (phiên 2): Layout + Auth
- **Prisma 6** — cố định ở bản 6 (theo EduTest). KHÔNG dùng Prisma 8 RC (CLI đổi command: không còn `generate`/`db push`; `init` sinh `prisma.config.ts` không tương thích). Đã update từ 8.0.0-rc.12 về 6.19.3 và xoá `prisma.config.ts`.
- **Middleware → Proxy** — Next 16 deprecated `middleware.ts`; migrate sang `src/proxy.ts` (đổi export `proxy`).
- **shadcn/ui base-nova** — registry cài bản mới dựa Base UI (`@base-ui/react`), không phải Radix. Select/Button API khác tiêu chuẩn. Select root KHÔNG nhận `className`, không có prop `items`.
- **Shadcn tokens** — thêm `card/popover/muted/input/ring/destructive/primary-foreground...` vào `@theme inline`. `--color-accent` = neutral hover (surface-hover); amber #D97706 dùng qua `--color-warning`. Radius A6Class (6/10/14/18/24) override qua `@theme`.
- **Auth (cũ)** — server actions (`src/lib/auth/actions.ts`) dùng `useActionState` + `redirect`; sign-up upsert User vào Prisma (best-effort, DB chưa sẵn thì bỏ qua). `getCurrentUser` (cache) fallback an toàn khi DB/Supabase chưa cấu hình. **(Đã thay toàn bộ bằng Neon Auth 2026-08-28; xem Pivot section.)**
- **Guard env** — proxy + auth + current.ts return gracefully khi `NEXT_PUBLIC_SUPABASE_URL` trống để app vẫn render trước khi có credential thật. (Giờ guard theo `NEON_AUTH_BASE_URL`.)
- **Shell layout** — desktop sidebar (w-64, active = primary-light) + mobile bottom nav (5 mục) + top bar; `AnimatedPage` (key=pathname → fade) cho page transitions.

## Pending (cần user)
- Email verification + trusted domain production cho Neon Auth (Vercel URL) khi deploy.
- Test users `*@a6class.test` còn trong Neon Auth (dành cho E2E dev — có thể dọn khi cần).
- Chưa commit lên GitHub (chờ user xác nhận).
