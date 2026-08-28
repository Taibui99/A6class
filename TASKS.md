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
- [ ] Dashboard page (stat cards, tasks, team, announcements — placeholder data)
- [ ] Placeholder pages (feed, nhan-tin, cau-hoi, ho-so with designed empty states) — done as pages
- [ ] Verify visual QA in browser

## Phase 3: Class Management
- [ ] Class CRUD
- [ ] Student management
- [ ] Team management
- [ ] Role system
- [ ] Permission model
- [ ] Class overview page

## Phase 4: Competition System
- [ ] Competition periods
- [ ] Point transactions
- [ ] Personal leaderboard
- [ ] Team leaderboard
- [ ] Achievement system
- [ ] Real-time score updates

## Phase 5: Tasks
- [ ] Task CRUD
- [ ] Task assignment
- [ ] Task submission
- [ ] Task review
- [ ] Task status tracking
- [ ] Deadline management

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
