# A6Class — Agent Instructions

## Stack
- Next.js 16 App Router (use `src/proxy.ts`, NOT deprecated middleware.ts)
- Neon Postgres + Neon Auth (Managed Better Auth) — see skills at `D:\A6Class\.agents\skills\neon\` and `neon-postgres\`
- Prisma 6 (ORM + migrations) — do NOT upgrade to Prisma 8 RC CLI
- Tailwind CSS v4
- shadcn/ui (base-nova style, Base UI primitives)
- TypeScript strict
- Vitest + Playwright
- Be Vietnam Pro font
- Lucide React icons

## Database & Auth
- Linked project: A6class (`snowy-fire-56923018`, org `org-snowy-sky-33509154`), branch `production`, region us-east-2. `.neon` at repo root.
- App connection: pooled `DATABASE_URL` (serverless). Migrations/Prisma: `directUrl = env("DATABASE_URL_UNPOOLED")` in `prisma/schema.prisma`.
- Neon Auth: `@neondatabase/auth` SDK. Server-side via `src/lib/auth/server.ts` (`createNeonAuth`), client hook via `src/lib/auth/client.ts`; auth routes mounted at `src/app/api/auth/[...path]/route.ts` (only GET+POST; refresh only from same host).
- Env lives in `.env` (CLI-managed from `neon env pull`) + `.env.local` (app secrets: `NEON_AUTH_COOKIE_SECRET`, URLs). NEVER overwrite `.env` by hand.
- CLI pattern: `npx neon@latest link/env pull/env push/neon-auth/...` — follow `SKILL.md` in the neon skill, prefer CLI over direct API.
- Neon MCP server (remote, OAuth): declared in `opencode.jsonc` as `mcp.neon`. Authorize via the opencode OAuth flow once; afterwards `list_projects`, `get_connection_string`, etc. are available. If OAuth is unwanted, switch to API-key auth (`Authorization: Bearer {env:NEON_API_KEY}` header) instead.
- Project skills registered for opencode via `skills.paths = [".agents/skills"]`.
- NOTE: Neon Auth upstream requires an `Origin` header on sign-up/sign-in POSTs — browsers send it automatically; local HTTP tests must set `Origin` manually.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck`
- Prisma: `npx prisma migrate dev` / generate / `npx prisma studio`
- Neon: `npx neon@latest env pull` (refresh DB+auth URLs)

## Workflow
1. Read TASKS.md for current phase
2. Load classos-design-bible skill before any UI work
3. Inspect existing code
4. Implement smallest coherent change
5. Run typecheck + lint
6. Update TASKS.md
7. Commit with clear message

## Rules
- Vietnamese UI text (no English in user-facing strings)
- No emojis as icons (use Lucide React SVG)
- Mobile-first responsive
- Handle loading/empty/error states
- Use Server Components by default
- Client Components only for interactivity
- Validate all input with Zod
- RLS for all tables (via Prisma; no Postgres RLS policies on Neon)
- No secrets in client code
- Prefer existing components
- Design tokens from globals.css (no arbitrary values)
- Respect prefers-reduced-motion

## Non-negotiable
1. Do NOT implement the whole roadmap in one pass
2. Do NOT silently change architecture
3. Do NOT add unrequested product features
4. Do NOT expose secrets to the browser
5. Do NOT use emoji as primary UI icons
6. Do NOT create AI-generated looking UI
7. Preserve working functionality
8. Prefer small, reversible changes
9. Use strict TypeScript
10. Handle loading, empty, error states

## Commit Convention
- `feat: ...` — new feature
- `fix: ...` — bug fix
- `refactor: ...` — code improvement
- `style: ...` — UI/CSS changes
- `test: ...` — adding tests
- `docs: ...` — documentation
- `chore: ...` — maintenance

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
