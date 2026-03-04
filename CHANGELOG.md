# Mission Control — CHANGELOG

## Session 5 (2026-02-20) — Build Network Dependency Risk Mitigation (Codex OPS-RISK-FIX-ALL-0220)

### Done
- `src/app/layout.tsx`
  - Removed `next/font/google` (`Geist`, `Geist_Mono`) import
  - Removed font variable dependency from body class
  - Cleaned up to work with default font stack without external Google Fonts fetch

## Session 3-4 (2026-02-17~18) — Phase 1-4 Integrated Control System Build

### Done

**Phase 1: Make Money Integration**
- `api/make-money/route.ts` — Make Money API proxy (portfolio/health/engines/trades)
- `MakeMoneyWidget.tsx` — Portfolio balance, P&L, engine status, recent trades display
- `types/status.ts` — ProxyResponse<T>, ServiceStatus common types

**Phase 2: Telegram Bot + Monitoring**
- `api/telegram-bot/route.ts` — Telegram Bot API proxy (stats/health/analyzed)
- `EventWidget.tsx` — Event statistics (total count, approaching deadlines, participation rate)
- `ConnectionMap.tsx` live — Real-time health check (online/degraded/offline)
- `StatsBar.tsx` — Integrated metrics added (trading P&L, event participation rate)
- "Monitoring" tab added to Dashboard (MakeMoneyWidget + EventWidget)

**Phase 3: OpenClaw Web Control**
- `api/openclaw-command/route.ts` — OpenClaw command API proxy (GET/POST)
- `OpenClawControl.tsx` — Project select + task input + engine select -> execute, queue, history
- "OpenClaw" tab added to Dashboard

**Phase 4: Overview + Power User Features**
- `Overview.tsx` — 4-card summary + integrated timeline (commits/OpenClaw/trades/events mixed) + 3 TrendCharts
- `TrendChart.tsx` — recharts-based trend chart (24h/7d/30d range toggle)
- `CommandPalette.tsx` — Cmd+K command palette (tab navigation, quick lookup, refresh)
- `NotificationBanner.tsx` — Notification banner (loss warning, service down alerts)
- `useKeyboardShortcuts.ts` — Keyboard shortcuts (1-8 tabs, R refresh, Cmd+K)
- `useNotifications.ts` — Notification system (PnL monitoring, service status detection)
- `api/snapshot/route.ts` — Supabase mc_snapshots GET/POST
- `api/trades-sync/route.ts` — Trade sync API
- `supabase/migrations/` — mc_snapshots, mc_trades table DDL
- Dashboard tab order: Overview(default) -> Projects -> Monitoring -> OpenClaw -> Activity -> Productivity -> Integrations -> Task Board

**Other**
- `AGENTS.md` — Codex/Claude Code file domain separation document
- `supabase-admin.ts` — Supabase server client
- `TaskBoard.tsx` — Agent color differentiation improved
- recharts dependency added

### Change Scale
- 27 files changed (+3,792 lines / -83 lines)
- 19 new files, 8 modified files

### Next
- Create Supabase mc_snapshots table (migration file is ready)
- Set up snapshot collection scheduler (scripts/collect-snapshots.ps1 or Vercel Cron)
- Phase 5 cross-project automation (optional)

### Resume Point
- Phase 1-4 core features fully implemented, build 0 errors
- Live data viewable when local services (Make Money, Telegram Bot, OpenClaw) are running
- Graceful offline display when services not running

---

## Session 2 (2026-02-14) — Documentation Registration + Environment Setup Complete

### Done
- Created project CLAUDE.md + CHANGELOG.md
- Registered in workspace CLAUDE.md + global CLAUDE.md
- Added deployUrl to constants.ts
- GitHub Token issued + Vercel environment variables set
- API operation confirmed (12 projects scanned, 30 feed items)

### Next (continue at home)
- **Supabase integration**: Create `project_snapshots` table -> save snapshot history -> trend chart
- **Dark mode toggle**: Toggle button in header + localStorage save (simple task)
- **Project search/sort**: Search bar + sort options (by recent commit/commit count/name)

### Resume Point
- Ready to start feature development (registration/deployment/environment setup all complete)
- Deploy URL: https://mission-control-psi-smoky.vercel.app
- Branch: `master`

---

## Session 1 (2026-02-13) — Initial Build

### Done
- Initial project build (Next.js 16 + TypeScript + Tailwind 4)
- Dashboard main page (4 tabs: Projects/Activity Feed/Productivity/Integrations)
- GitHub API integration (commit history, file existence check, CHANGELOG parsing)
- Project cards (category badges, health status, neglect warning 7/14 days)
- Stats bar (weekly commits, active/operational/neglected counts)
- Activity feed (all-project commit unified timeline, date-grouped)
- Productivity stats (commit streak, 7-day heatmap, per-project bar chart)
- Integration map (inter-project relationship visualization)
- Project detail page (`/project/[folder]`)
- Vercel deployment (https://mission-control-psi-smoky.vercel.app)
- GitHub repo creation + initial commit/push
