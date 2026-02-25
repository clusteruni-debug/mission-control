# Mission Control

## 스택
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS 4 + recharts + Supabase

## 실행
```bash
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm run lint
```

## 배포
Vercel (git push = 자동 배포)

## 구조
```
src/
├── app/
│   ├── page.tsx                # Dashboard 진입점
│   ├── api/                    # scan, feed, bot-status, task-board, make-money, telegram-bot, openclaw-command, snapshot, trades-sync
│   └── project/[folder]/       # 프로젝트 상세 (orchestrator → project-detail/)
├── components/
│   ├── Dashboard.tsx            # 메인 오케스트레이터 → dashboard/
│   ├── dashboard/               # DashboardHeader, TabNavigation, TabContent, types
│   ├── Overview.tsx             # 오버뷰 오케스트레이터 → overview/
│   ├── overview/                # SummaryCards, TrendChartSection, TimelineSection, RoadmapSection, types, utils
│   ├── MakeMoneyWidget.tsx      # Make Money 오케스트레이터 → make-money/
│   ├── make-money/              # PortfolioSummary, EngineStatusList, RecentTrades, types, format-utils
│   ├── project-detail/          # SummaryCard, Section, ProjectHeader, ConnectionsPanel, CommitHistory, ChangelogSection
│   └── (기타)                   # ProjectCard, StatsBar, EventWidget, BotStatus, TrendChart, CommandPalette, etc.
├── hooks/                       # useKeyboardShortcuts, useNotifications
├── lib/                         # constants, github, supabase, supabase-admin, utils
└── types/                       # index.ts, status.ts (SSOT)
```

**주의**: 서브디렉토리 barrel export (index.ts)는 circular import 유발 가능. 오케스트레이터에서는 직접 파일 경로 import 사용 (예: `./overview/SummaryCards` not `./overview`).

## 환경변수 (.env.local)
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, COLLECTOR_SECRET, GITHUB_TOKEN
로컬 서비스: MAKE_MONEY_API_URL(3001), TELEGRAM_BOT_API_URL(5001), OPENCLAW_HEALTH_URL(7100)

## 고유 제약
- constants.ts 수정 시 워크스페이스 CLAUDE.md 프로젝트 테이블 동기화
- GitHub API rate limit: 토큰 없으면 60회/시간
- next: { revalidate: 300 } — API 5분 캐시
- Turbopack에서 변수-경로 dynamic import 금지
- types/status.ts는 SSOT — 수정 시 영향도 분석 필수
- 로컬 서비스 미실행 시 graceful offline 표시

## Vercel 미설정 항목
SUPABASE_*, COLLECTOR_SECRET, OPENCLAW_*, MAKE_MONEY_API_URL (외부 접근 필요)

## 참조
- CC/CX 파일 담당: agent_docs/domain-map.md
