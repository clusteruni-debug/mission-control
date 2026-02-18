# Mission Control

> 워크스페이스 프로젝트 관제 대시보드

## 스택

- **프레임워크**: Next.js 16 (App Router, Turbopack)
- **언어**: TypeScript
- **스타일**: Tailwind CSS 4
- **아이콘**: Lucide React
- **차트**: recharts (TrendChart)
- **백엔드**: Supabase (스냅샷 저장용)
- **데이터 소스**: GitHub API, Make Money API, Telegram Bot API, OpenClaw API

## 구조

```
src/
├── app/
│   ├── page.tsx                    # Dashboard 진입점
│   ├── layout.tsx                  # 레이아웃 (Geist 폰트, 다크모드)
│   ├── globals.css                 # Tailwind 글로벌
│   ├── api/
│   │   ├── scan/route.ts           # 전체 프로젝트 스캔 API
│   │   ├── scan/[folder]/          # 개별 프로젝트 상세 API
│   │   ├── feed/route.ts           # 통합 활동 피드 API
│   │   ├── bot-status/route.ts     # OpenClaw 봇 상태 프록시 API
│   │   ├── task-board/route.ts     # AGENT_TASK_BOARD.md 파싱 API
│   │   ├── make-money/route.ts     # Make Money API 프록시 (portfolio/health/engines/trades)
│   │   ├── telegram-bot/route.ts   # Telegram Bot API 프록시 (stats/health/analyzed)
│   │   ├── openclaw-command/route.ts # OpenClaw command API 프록시 (GET/POST)
│   │   ├── snapshot/route.ts       # Supabase mc_snapshots CRUD (GET/POST)
│   │   └── trades-sync/route.ts    # 거래 동기화 API
│   └── project/[folder]/           # 프로젝트 상세 페이지
├── components/
│   ├── Dashboard.tsx               # 메인 대시보드 (탭 8개: Overview/프로젝트/모니터링/OpenClaw/피드/생산성/연동/보드)
│   ├── Overview.tsx                # 통합 Overview (4카드 + 타임라인 + TrendChart 3종)
│   ├── ProjectCard.tsx             # 프로젝트 카드 (건강 상태 + 플랫폼 뱃지)
│   ├── StatsBar.tsx                # 상단 통계 바 (+ 매매 P&L, 이벤트 참여율)
│   ├── MakeMoneyWidget.tsx         # Make Money 위젯 (포트폴리오/엔진/거래)
│   ├── EventWidget.tsx             # Telegram 이벤트 위젯 (통계/마감임박/참여율)
│   ├── OpenClawControl.tsx         # OpenClaw 웹 컨트롤 패널 (커맨드/큐/히스토리)
│   ├── TrendChart.tsx              # recharts 추세 차트 (24h/7d/30d)
│   ├── CommandPalette.tsx          # Cmd+K 명령 팔레트
│   ├── NotificationBanner.tsx      # 알림 배너 (손실 경고, 서비스 다운)
│   ├── ActivityFeed.tsx            # 커밋 타임라인 (날짜별 그룹)
│   ├── ProductivityStats.tsx       # 생산성 차트 (streak + 히트맵)
│   ├── ConnectionMap.tsx           # 프로젝트 연동 관계도 (라이브 헬스체크)
│   ├── BotStatus.tsx               # OpenClaw 봇 상태 카드
│   └── TaskBoard.tsx               # 칸반 뷰 (에이전트별 색상)
├── hooks/
│   ├── useKeyboardShortcuts.ts     # 키보드 단축키 (1-8 탭, R, Cmd+K)
│   └── useNotifications.ts         # 알림 시스템 (PnL/서비스 상태)
├── lib/
│   ├── constants.ts                # 프로젝트 목록 + 카테고리 + 플랫폼
│   ├── github.ts                   # GitHub API 호출 + 스캔 로직
│   ├── supabase.ts                 # Supabase 클라이언트 (anon)
│   ├── supabase-admin.ts           # Supabase 서버 클라이언트 (service role)
│   └── utils.ts                    # cn(), formatRelativeDate()
├── types/
│   ├── index.ts                    # 공유 타입 (ProjectConfig, MakeMoney*, TaskBoardItem 등)
│   └── status.ts                   # ServiceStatus, ProxyResponse<T> (SSOT)
└── ...
supabase/
└── migrations/
    ├── 001_mc_snapshots.sql        # mc_snapshots 테이블 DDL
    └── 002_mc_trades.sql           # mc_trades 테이블 DDL
scripts/                            # (Codex 관리) 수집 자동화 스크립트
```

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

## 환경변수

```bash
# .env.local 필요 (전체 목록은 .env.example 참고)

# Supabase (서버사이드 — 스냅샷 저장)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 스냅샷 수집 인증
COLLECTOR_SECRET=your-collector-secret

# GitHub API
GITHUB_TOKEN=                        # 없으면 60회/시간, 있으면 5000회

# 로컬 서비스 (기본값 있음, 변경 시에만)
# MAKE_MONEY_API_URL=http://localhost:3001
# TELEGRAM_BOT_API_URL=http://localhost:5001
# OPENCLAW_HEALTH_URL=http://localhost:7100
```

## Vercel 환경변수 현황

| 변수 | 상태 | 비고 |
|------|------|------|
| `GITHUB_TOKEN` | ✅ 설정됨 | Dev/Preview/Prod |
| `TELEGRAM_BOT_API_URL` | ✅ 설정됨 | Railway: `telegram-event-bot-production-5421.up.railway.app` |
| `SUPABASE_URL` | ❌ 미설정 | 스냅샷 수집/조회 기능 필요 시 추가 |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ 미설정 | 위와 동일 |
| `COLLECTOR_SECRET` | ❌ 미설정 | 스냅샷 POST 인증용 |
| `OPENCLAW_HEALTH_URL` | ❌ 미설정 | WSL 전용 — Tailscale Funnel 또는 Railway 배포 필요 |
| `OPENCLAW_API_URL` | ❌ 미설정 | 위와 동일 |
| `MAKE_MONEY_API_URL` | ❌ 미설정 | Windows 전용 — Tailscale Funnel 또는 별도 배포 필요 |

### TODO (Vercel 배포 완성)

1. Supabase 환경변수 3개 추가 (Vercel 대시보드에서 수동)
2. OpenClaw health_api를 외부 접근 가능하게 만들기 (Tailscale Funnel 또는 Railway)
3. Make Money API를 외부 접근 가능하게 만들기 (위와 동일)

## 주의사항

- `constants.ts`에 프로젝트 추가/수정 시 워크스페이스 CLAUDE.md도 동기화
- GitHub API rate limit: 토큰 없으면 60회/시간, 있으면 5000회/시간
- `next: { revalidate: 300 }` — API 응답 5분 캐시
- 로컬 서비스(Make Money, Telegram Bot, OpenClaw) 미실행 시 graceful offline 표시
- 작업 보드: `AGENT_TASK_BOARD.md`가 없으면 빈 상태 표시
- Turbopack에서 변수-경로 dynamic import 불가 (`import('./' + name)` 패턴 사용 금지)
- `src/types/status.ts`는 SSOT — 수정 시 영향도 분석 필수
