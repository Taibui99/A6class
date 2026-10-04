# A6Class — Tasks & Progress

> Nguồn duy nhất để theo dõi tiến độ. Đánh dấu `[x]` sau khi THỰC SỰ xong.

## Phase 1: Foundation
- [x] Project init (Next.js 16 + Tailwind v4 + shadcn/ui)
- [x] Prisma schema (30+ tables) + Prisma 6 client
- [x] Auth proxy (src/proxy.ts, migrated from middleware)
- [x] Design tokens (globals.css) + full shadcn token mapping
- [x] Landing page
- [x] Login/Register pages + auth server actions (signIn/signUp/signOut)
- [x] Neon Postgres connected (neon link → .env → Prisma migrate applied)
- [x] Neon Auth (Managed Better Auth) provisioned + full auth flow E2E tested (register → session → dashboard)
- [x] Environment variables (real values: Neon + Neon Auth)
- [ ] Email verification config (production)
- [ ] Trusted domain for production (Vercel URL) via `neon neon-auth domain add`

## Phase 2: Design System + Layout
- [x] shadcn/ui components (Button, Card, Input, Badge, Avatar, Skeleton, Dialog, Sheet, Select, Tabs, Tooltip, Toast, DropdownMenu, Separator, Label, Textarea)
- [x] Auth shell + login/register forms (useActionState, loading/error states, show-hide password)
- [x] Desktop sidebar navigation (SidebarNav, Brand, UserMenu)
- [x] Mobile bottom navigation (BottomNav)
- [x] App shell layout ((app) group: header, sidebar, animated pages)
- [x] Loading / error states (loading.tsx, error.tsx)
- [x] Basic animations (fade in, slide in, scale in, reduced-motion support)
- [x] Dashboard page (stat cards, tasks, team, announcements — live scoreboard & task integration)
- [ ] Placeholder pages (feed, nhan-tin, cau-hoi, ho-so with designed empty states) — done as pages
- [ ] Verify visual QA in browser

## Phase 3: Class Management
- [ ] Class CRUD
- [x] Student management (MembersDirectory with 36 students & roles)
- [x] Team management (Team overview & 4-team roster)
- [x] Role system (Ban cán sự & Tổ trưởng spotlight)
- [ ] Permission model
- [x] Class overview page (/members & /class)

## Phase 4: Competition System
- [x] Competition periods
- [x] Point transactions
- [x] Personal leaderboard
- [x] Team leaderboard (Enhanced Podium Top 1, medals, progress bars)
- [ ] Achievement system
- [x] Real-time score updates

## Phase 5: Tasks
- [x] Task CRUD (Create task modal with title, team, priority, deadline, points)
- [x] Task assignment (Assign to teams, whole class, or roles)
- [x] Task submission (Submission counters & review)
- [x] Task review
- [x] Task status tracking (Interactive toggle TODO -> IN_PROGRESS -> COMPLETED)
- [x] Deadline management (Relative time countdown & urgent badges)

## Phase 6: Social Features
- [ ] Class feed
- [ ] Comment system
- [ ] Reaction system
- [ ] Pin posts
- [ ] Question/Help system
- [ ] Answer system

## Phase 7: Chat + Voice
- [ ] Direct messaging
- [ ] Team conversations
- [ ] Class conversation
- [ ] Voice messages
- [ ] File sharing

## Phase 8: Dashboards + Analytics
- [ ] Teacher dashboard
- [ ] Student dashboard
- [ ] Monitor dashboards
- [ ] Analytics charts
- [ ] Reports system

## Phase 9: Polish
- [ ] Animation system
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Mobile polish
- [ ] Error handling

## Phase 10: Testing + Deploy
- [ ] Unit tests
- [ ] E2E tests
- [ ] Security audit
- [ ] Deploy to Vercel
- [ ] Monitoring
