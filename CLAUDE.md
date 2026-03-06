# Mission Control

## Stack
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS 4 + recharts + Supabase

## Run
```bash
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint
```

## Deployment
Vercel (git push = auto deploy)

## Structure
```
src/
├── app/
│   ├── page.tsx                # Dashboard entry point
│   ├── api/                    # scan, feed, bot-status, task-board, make-money, telegram-bot, snapshot, trades-sync
│   └── project/[folder]/       # Project detail (orchestrator -> project-detail/)
├── components/
│   ├── Dashboard.tsx            # Main orchestrator -> dashboard/
│   ├── dashboard/               # DashboardHeader, TabNavigation, TabContent, types
│   ├── Overview.tsx             # Overview orchestrator -> overview/
│   ├── overview/                # SummaryCards, TrendChartSection, TimelineSection, RoadmapSection, types, utils
│   ├── MakeMoneyWidget.tsx      # Make Money orchestrator -> make-money/
│   ├── make-money/              # PortfolioSummary, EngineStatusList, RecentTrades, types, format-utils
│   ├── project-detail/          # SummaryCard, Section, ProjectHeader, ConnectionsPanel, CommitHistory, ChangelogSection
│   └── (other)                  # ProjectCard, StatsBar, EventWidget, BotStatus, TrendChart, CommandPalette, etc.
├── hooks/                       # useKeyboardShortcuts, useNotifications
├── lib/                         # constants, github, supabase, supabase-admin, utils
└── types/                       # index.ts, status.ts (SSOT)
```

**Note**: Subdirectory barrel exports (index.ts) can cause circular imports. In orchestrators, use direct file path imports (e.g., `./overview/SummaryCards` not `./overview`).

## Environment Variables (.env.local)
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, COLLECTOR_SECRET, GITHUB_TOKEN
Local services: MAKE_MONEY_API_URL(3001), TELEGRAM_BOT_API_URL(5001), OPENCLAW_HEALTH_URL(7100)

## Project-Specific Constraints
- Sync workspace CLAUDE.md project table when modifying constants.ts
- GitHub API rate limit: 60 requests/hour without token
- next: { revalidate: 300 } — API 5-minute cache
- Variable-path dynamic import prohibited in Turbopack
- types/status.ts is SSOT — impact analysis required before modification
- Graceful offline display when local services are not running

## Vercel Unconfigured Items
SUPABASE_*, COLLECTOR_SECRET, OPENCLAW_*, MAKE_MONEY_API_URL (external access needed)

## References
- CC/CX file ownership: agent_docs/domain-map.md
