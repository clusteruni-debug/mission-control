# Mission Control — CHANGELOG

## 세션 3-4 (2026-02-17~18) — Phase 1-4 통합 관제 시스템 구축

### ✅ 완료

**Phase 1: Make Money 연동**
- `api/make-money/route.ts` — Make Money API 프록시 (portfolio/health/engines/trades)
- `MakeMoneyWidget.tsx` — 포트폴리오 잔고, P&L, 엔진 상태, 최근 거래 표시
- `types/status.ts` — ProxyResponse<T>, ServiceStatus 공통 타입

**Phase 2: Telegram Bot + 모니터링**
- `api/telegram-bot/route.ts` — Telegram Bot API 프록시 (stats/health/analyzed)
- `EventWidget.tsx` — 이벤트 통계 (총 수, 마감 임박, 참여율)
- `ConnectionMap.tsx` 라이브화 — 실시간 헬스체크 (online/degraded/offline)
- `StatsBar.tsx` — 통합 지표 추가 (매매 P&L, 이벤트 참여율)
- Dashboard에 "모니터링" 탭 신설 (MakeMoneyWidget + EventWidget)

**Phase 3: OpenClaw 웹 컨트롤**
- `api/openclaw-command/route.ts` — OpenClaw command API 프록시 (GET/POST)
- `OpenClawControl.tsx` — 프로젝트 선택 + 작업 입력 + 엔진 선택 → 실행, 큐, 히스토리
- Dashboard에 "OpenClaw" 탭 추가

**Phase 4: Overview + 파워유저 기능**
- `Overview.tsx` — 4-card 요약 + 통합 타임라인 (커밋/OpenClaw/거래/이벤트 혼합) + TrendChart 3종
- `TrendChart.tsx` — recharts 기반 추세 차트 (24h/7d/30d 범위 전환)
- `CommandPalette.tsx` — Cmd+K 명령 팔레트 (탭 이동, 빠른 조회, 새로고침)
- `NotificationBanner.tsx` — 알림 배너 (손실 경고, 서비스 다운 알림)
- `useKeyboardShortcuts.ts` — 키보드 단축키 (1-8 탭, R 새로고침, Cmd+K)
- `useNotifications.ts` — 알림 시스템 (PnL 모니터링, 서비스 상태 감지)
- `api/snapshot/route.ts` — Supabase mc_snapshots GET/POST
- `api/trades-sync/route.ts` — 거래 동기화 API
- `supabase/migrations/` — mc_snapshots, mc_trades 테이블 DDL
- Dashboard 탭 순서: Overview(기본) → 프로젝트 → 모니터링 → OpenClaw → 활동 → 생산성 → 연동 → 작업보드

**기타**
- `AGENTS.md` — Codex/Claude Code 파일 영역 분리 문서
- `supabase-admin.ts` — Supabase 서버 클라이언트
- `TaskBoard.tsx` — 에이전트별 색상 구분 개선
- recharts 의존성 추가

### 📊 변경 규모
- 27 파일 변경 (+3,792줄 / -83줄)
- 신규 19파일, 수정 8파일

### ⏭️ 다음
- Supabase mc_snapshots 테이블 생성 (마이그레이션 파일은 준비됨)
- 스냅샷 수집 스케줄러 설정 (scripts/collect-snapshots.ps1 or Vercel Cron)
- Phase 5 크로스 프로젝트 자동화 (선택적)

### 📍 재개 지점
- Phase 1-4 핵심 기능 전부 구현 완료, 빌드 에러 0건
- 로컬 서비스(Make Money, Telegram Bot, OpenClaw) 실행 시 실데이터 확인 가능
- 미실행 시 graceful offline 표시

---

## 세션 2 (2026-02-14) — 문서 등록 + 환경 설정 완료

### ✅ 완료
- 프로젝트 CLAUDE.md + CHANGELOG.md 생성
- 워크스페이스 CLAUDE.md + 글로벌 CLAUDE.md에 프로젝트 등록
- constants.ts에 deployUrl 추가
- GitHub Token 발급 + Vercel 환경변수 설정 완료
- API 정상 동작 확인 (12개 프로젝트 스캔, 30개 피드 항목)

### ⏭️ 다음 (집에서 이어서)
- **Supabase 연동**: `project_snapshots` 테이블 생성 → 스냅샷 히스토리 저장 → 트렌드 차트
- **다크모드 토글**: 헤더에 토글 버튼 + localStorage 저장 (간단 작업)
- **프로젝트 검색/정렬**: 검색바 + 정렬 옵션 (최근 커밋순/커밋 수순/이름순)

### 📍 재개 지점
- 기능 개발 시작 가능 (등록/배포/환경설정 모두 완료)
- 배포 URL: https://mission-control-psi-smoky.vercel.app
- 브랜치: `master`

---

## 세션 1 (2026-02-13) — 초기 구축

### ✅ 완료
- 프로젝트 초기 구축 (Next.js 16 + TypeScript + Tailwind 4)
- 대시보드 메인 페이지 (4탭: 프로젝트/활동피드/생산성/연동)
- GitHub API 연동 (커밋 히스토리, 파일 존재 확인, CHANGELOG 파싱)
- 프로젝트 카드 (카테고리 뱃지, 건강 상태, 방치 경고 7일/14일)
- 통계바 (주간 커밋, 활성/운영/방치 카운트)
- 활동 피드 (전체 프로젝트 커밋 타임라인, 날짜별 그룹)
- 생산성 통계 (연속 커밋 일수, 7일 히트맵, 프로젝트별 바차트)
- 연동 맵 (프로젝트 간 관계 시각화)
- 프로젝트 상세 페이지 (`/project/[folder]`)
- Vercel 배포 (https://mission-control-psi-smoky.vercel.app)
- GitHub 레포 생성 + 초기 커밋/push
