# 바이브코딩 워크스페이스 — Claude Web Handoff

> **자동 생성**: 2026-02-21 20:21 KST
> **용도**: Claude.ai web에 공유하여 전체 컨텍스트를 전달

---

## §1 워크스페이스 개요

| 항목 | 값 |
|------|-----|
| **이름** | 바이브코딩 (Vibe Coding) |
| **소유자** | 1인 개발자 (clusteruni-debug GitHub org) |
| **구조** | 멀티 프로젝트 모노레포 (12개 프로젝트) |
| **메인 PC** | Windows 11 + WSL2 (Ubuntu 24.04) |
| **경로** | `C:\vibe` (Windows) / `/mnt/c/vibe` (WSL) -- NTFS junction |
| **원격 접속** | SSH -> Tailscale -> WSL (노트북/폰에서 이어서 작업) |
| **AI 에이전트** | 3-Agent: Claude Code(구현), Codex(병렬 실행), Claude Web(설계/검수) |

### 4공간 구조

| 공간 | 경로 | 용도 |
|------|------|------|
| **active** | `projects/프로젝트명/` | 12개 활성 프로젝트 |
| **docs** | `docs/plans/`, `docs/guides/` | 가이드, 플랜, 운영 문서 |
| **archive** | `archive/` | 레거시 파일 (삭제 대신 이동) |
| **memory** | `memory/` | 세션 간 컨텍스트 유지 |

### 핵심 문서 체인 (우선순위 높은 순)

1. 프로젝트 `AGENTS.md` -- 파일 도메인, 실행 규칙
2. 프로젝트 `CLAUDE.md` -- 프로젝트 고유 규칙
3. 루트 `AGENTS.md` -- 에이전트 간 공통 프로토콜
4. 루트 `CLAUDE.md` -- 워크스페이스 공통 규칙
5. `~/.claude/CLAUDE.md` -- 전역 규칙

---

## §2 프로젝트 현황

| # | 프로젝트 | 스택 | 배포 | 최근 커밋 | 경과일 |
|---|----------|------|------|----------|--------|
| 1 | **X Article Editor** | Next.js 16 + TS + Supabase + TipTap | Vercel | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 | 1일 |
| 2 | **자산관리 (Web3 가계부)** | Vite + Vanilla JS + Supabase + Chart.js | Vercel | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 | 1일 |
| 3 | **Navigator (todolist)** | HTML + Vanilla JS + Firebase | GitHub Pages | chore: ROADMAP.md 제거 (archive/roadmaps/로 이관 완료) | 0일 |
| 4 | **Baby Care** | Next.js 16 + TS + Firebase | Vercel | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 | 1일 |
| 5 | **Kimchi Premium** | React + Vite + WebSocket | 로컬 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 | 1일 |
| 6 | **Telegram Event Bot** | Python + Flask + Supabase | 로컬 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 | 1일 |
| 7 | **Portfolio** | Vite + React + TS + Tailwind + Framer | GitHub Pages | refactor: 포트폴리오 전면 리디자인 — 다크 글로우→라이트 미니멀 톤 | 1일 |
| 8 | **Text RPG (심연)** | Vite + Vanilla JS | 로컬 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 | 1일 |
| 9 | **Saitama Training** | React + TS + Firebase + zustand | Vercel | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 | 1일 |
| 10 | **Make Money** | Node.js + Express + SQLite + Claude AI | 로컬 | feat: CEO 모드 수동 오버라이드 API 추가 | 0일 |
| 11 | **OpenClaw (코딩봇)** | Python + telegram-bot + Claude Agent SDK | WSL pm2 | feat: Phase 1 UX — 에러 해석 보고 + 일일 보고서 + Rich Format | 0일 |
| 12 | **Mission Control** | Next.js 16 + TS + Tailwind v4 | Vercel | fix: API 응답 방어 코드 강화 — y.map is not a function 크래시 해결 | 0일 |

---

## §3 최근 활동 (7일)

| 프로젝트 | 커밋 수 | 최신 변경 |
|----------|---------|----------|
| **X Article Editor** | 14건 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 |
| **자산관리 (Web3 가계부)** | 11건 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 |
| **Navigator (todolist)** | 11건 | chore: ROADMAP.md 제거 (archive/roadmaps/로 이관 완료) |
| **Baby Care** | 15건 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 |
| **Kimchi Premium** | 14건 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 |
| **Telegram Event Bot** | 13건 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 |
| **Portfolio** | 11건 | refactor: 포트폴리오 전면 리디자인 — 다크 글로우→라이트 미니멀 톤 |
| **Text RPG (심연)** | 10건 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 |
| **Saitama Training** | 17건 | refactor: CLAUDE.md 압축 + agent_docs 도메인맵 추가 |
| **Make Money** | 100건 | feat: CEO 모드 수동 오버라이드 API 추가 |
| **OpenClaw (코딩봇)** | 39건 | feat: Phase 1 UX — 에러 해석 보고 + 일일 보고서 + Rich Format |
| **Mission Control** | 28건 | fix: API 응답 방어 코드 강화 — y.map is not a function 크래시 해결 |

---

## §4 활성 작업

| TASK-ID | 담당 | 상태 | 대상 | 비고 |
|---------|------|------|------|------|
| TRADINGLAB-005 | codex | in_progress | AGENT_TASK_BOARD.md, projects/coin-test-project/tradinglab/dashboard.py, projects/coin-test-project/README.md | 대시보드 용어 한글화 진행 |


---

## §5 블로커/리스크

없음 (ERROR-BOOK 미해결 건 0).

---

## §6 진행 중 작업

### 6-1. OpenClaw 봇 -- 패턴 이식 기반 대규모 업그레이드

**전략 배경**: 공식 OpenClaw 프레임워크(Node.js, 140K+ GitHub stars) 설치 대신, MIT 라이선스 소스에서 필요한 설계 패턴만 추출하여 기존 Python 봇(python-telegram-bot v22 + Claude Agent SDK)에 이식. 이유는 §5 보안 리스크 참조.

**목표**: 코딩 디스패처 -> 개인 운영 에이전트 전환

**아키텍처 변경 핵심:**

#### A. 멀티 에이전트 라우팅 (bot.py)
- `/code <메시지>` -> Claude 에이전트 (분석, 전략, 글쓰기, 크립토 모니터링)
- `/codex <메시지>` -> Codex 에이전트 (코드 작성, 디버깅, 빌드, DB 작업)
- `/triangle` -> Codex 구현 -> Claude 검수 (자동 수정 포함)
- `/duet` -> Codex <-> Claude 핑퐁 (구현->코멘트->반영->빌드체크)
- `/auto` -> Claude 자율 계획(JSON) -> 단계별 Codex/Claude 자동 실행
- 프리픽스 없음 -> Brain (Claude Agent SDK) 자연어 처리 기본 라우팅
- Claude: Agent SDK(`claude-agent-sdk 0.1.38`) 호출
- Codex: `codex exec` CLI 직접 호출 (runner.py)

#### B. 워크스페이스 파일 로딩 (brain.py)
- OpenClaw `bootstrap-files.ts` 패턴 -> Python 이식
- `workspace/` 디렉토리에서 SOUL.md, USER.md, AGENTS.md, TOOLS.md 자동 로드
- 시스템 프롬프트를 personas.py 하드코딩 -> 파일 기반 동적 구성으로 전환
- 파일당 65,536자 제한, 파일 없으면 기존 하드코딩 fallback (graceful)

#### C. 워크스페이스 파일 설계

**SOUL.md (공용 에이전트 톤)**:
- 결론 우선, 배경은 요청 시에만
- 확인되지 않은 정보는 "불확실하다" 명시
- 의례적 인사 금지 (기존 QUICK_RESPONSES 톤 다운, fallback으로 보존)
- 이모지는 상태 표시만 허용
- 추측을 사실처럼 말하지 않기

**SOUL-codex.md (Codex 전용 페르소나)**: Codex 전용 톤 (코드 중심, 문제 재정의->코드->설명 스타일). CCB-017에서 구현, review 대기 중.

**USER.md**: 사용자 컨텍스트 (크립토 모니터링 50-60 텔레그램 채널, 바이브코딩 1인 개발자)

**AGENTS.md**: 그룹 채팅 @멘션 필수, Heartbeat 30분(존재 여부만), 파일 조작 안전 규칙

**TOOLS.md**: WSL Ubuntu-ssh, Tailscale VPN, PM2 프로세스 관리, 프로젝트 경로

#### D. 스킬 시스템 (brain.py 스킬 로더)
- `workspace/skills/<name>/SKILL.md` 스캔 -> Available Skills 목록만 프롬프트에 주입
- 에이전트가 필요 시 SKILL.md 본문 Read
- OpenClaw의 경량 스킬 매니페스트 패턴 이식

**첫 번째 스킬 -- telegram-parser**:
- 트리거: 포워딩 메시지 또는 "정리해줘", "파싱해줘"
- 추출 필드: 프로젝트명, 유형(airdrop|testnet|ama|mint|quest|snapshot|tge), 마감일, 참여 조건, 예상 보상, 난이도(easy|medium|hard), 링크
- 출력 포맷: 2-3줄 압축 요약
- 자동 제외: paid mint > $50, 스캠 키워드("send ETH to", "guaranteed profit", "100x"), 중복 프로젝트

#### E. 크론 시스템 + 그룹 지원
- cron.py: HH:MM 기반 스케줄러 (08:00 크립토 다이제스트, 21:00 프로젝트 상태)
- 그룹 @멘션 응답 (group_mode: 3문장 이내, EXECUTE 금지)
- 하트비트 30분 (존재 여부만 표시, 작업 내용 비공개)

#### F. 모듈 분리 (Codex Prompt 01 -- CCB-019 done)
- bot.py 1900줄 -> 오케스트레이션 중심 정리
- handlers/commands.py: 커맨드 핸들러 분리
- handlers/scheduler.py: 크론/스케줄링
- handlers/messaging.py: 메시지 처리
- handlers/__init__.py: 패키지 초기화

#### G. Runner 안전성 (Codex Prompt 02)
- runner.py: ErrorCategory 7종 분류
- progress_cb 보호, stderr tail
- 커밋 완료

#### H. Brain 라우팅 강화 (Codex Prompt 03 -- CCB-018 done)
- EXECUTE 파서 강화
- fallback UX + backoff
- intent.py 톤 간결화

#### I. ROADMAP (2026-02-20 신규)
- Phase 1: 체감 기능 (dashboard, 에러 해석, cost 추적)
- Phase 2: 자연어 실행 안정화
- Phase 3: 스킬/자동화 확장
- Phase 4: 그룹/멀티챗
- Phase 5: 자율 운영

**완료 상태:**

| 기능 | 상태 |
|------|------|
| 워크스페이스 파일 로딩 (SOUL/USER/AGENTS/TOOLS.md) | committed |
| 스킬 시스템 (매니페스트 + telegram-parser) | committed |
| 포워딩 메시지 파서 (telegram_parser.py) | committed |
| 크론 시스템 (cron.py) | committed |
| 그룹 @멘션 + 하트비트 | committed |
| 멀티 에이전트 라우팅 (/code, /codex, /triangle, /duet, /auto) | committed |
| Brain 재시도 + typing indicator | committed |
| Runner ErrorCategory 7종 + progress_cb 보호 | committed |
| health_api 보강 (success_rate_24h, process_alive) | committed |
| bot.py 모듈 분리 -> handlers/ | done (CCB-019) |
| Brain EXECUTE 파서 강화 + fallback UX | done (CCB-018) |
| SOUL-codex.md (Codex 전용 페르소나) | done (CCB-017) |
| ROADMAP.md Phase 1-5 | committed |

**현재 문제 -- Brain 응답 속도/안정성:**
- Brain 초기화: 성공 (Claude Agent SDK v0.1.38)
- 자연어 대화: 동작 확인 (12.4초 응답, typing indicator로 UX 완화)
- 실패 패턴: rate_limit_event (SDK 미지원), timeout, CLI exit code 1
- 완화책: 재시도 로직(최대 2회, 5/10초 백오프), 타임아웃 90초

**핵심 과제:** Brain이 안정적으로 동작해야 자연어->EXECUTE 코딩 디스패치가 작동함. 현재는 Brain 실패 시 regex fallback(패턴 5개만 인식)으로 떨어져 자연어 처리 불가.

### 6-2. Make Money 엔진 개선 (활발)

- Session 4 (최신): sync-recovery 무한 임포트 루프 수정, PnL 하드코딩 0 → 실제 계산, paper 모드 제거, safety 완화, trade journal JSONL 추가, 체크포인트 4h, 대시보드 수정
- DB 마이그레이션 완료: 16건 PnL 보정 + 55건 중복 삭제 (PnL $-7.33 → $-0.04)
- 봇 현재 상태: LIVE, USDC $24.70, 56거래 (승률 33.9%), AI 예산 $44.93 잔여
- Codex review 대기 중: 엔진 시그널 최적화(MM-CODEX-017), 대시보드 WebSocket(MM-CODEX-016), 대시보드 상태 가시성(MM-CODEX-018)

### 6-3. 주요 아키텍처 결정 기록 (ADR)

| 결정 | 선택 | 기각된 대안 | 이유 |
|------|------|------------|------|
| OpenClaw 도입 방식 | 패턴만 이식 | 공식 프레임워크 설치 | 보안 리스크: CVE-2026-25253 RCE, 크리덴셜 평문, ClawHub 12% 악성 스킬, 40K+ 노출 인스턴스 |
| 멀티 에이전트 분기 | 프리픽스 라우팅 (/code, /codex 등) | 텔레그램 봇 2개 분리 | 단일 채널 운영 단순성, 컨텍스트 공유 용이 |
| 시스템 프롬프트 관리 | 워크스페이스 .md 파일 | personas.py 하드코딩 | 실시간 수정 가능, 에이전트별 분리 용이. 하드코딩은 fallback 보존 |
| 스킬 시스템 | 매니페스트만 주입 + 온디맨드 Read | 전체 내용 시스템 프롬프트 포함 | 토큰 절약, 컨텍스트 윈도우 효율 |
| 봇 실행 환경 | 메인 PC WSL (PM2) | Mac Mini 격리 / 클라우드 VM | 추가 비용 0, 기존 인프라 재사용. 패턴 이식으로 공격 표면이 작아져 격리 긴급성 낮음 |
| Codex 호출 방식 | `codex exec` CLI 직접 호출 | SDK 통합 | OpenAI Codex CLI가 유일한 공식 인터페이스 |

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

## §7 DB 스키마 현황

| 프로젝트 | DB | 테이블/컬렉션 | 소스 파일 |
|---------|-----|--------------|----------|
| 자산관리 (Web3 가계부) | Supabase | accounts, transactions, recurring_items, rpg_data | `supabase/schema.sql` |
| Navigator (todolist) | Firebase + localStorage | (설정 파일 없음) | `(없음)` |
| Baby Care | Firebase | (매칭 없음) | `lib/firebase/firestore.ts` |
| Kimchi Premium | Supabase | (매칭 없음) | `react-app/src/hooks/usePaperTrades.js` |
| Telegram Event Bot | Supabase | (매칭 없음) | `database.py` |
| Saitama Training | Firebase | (매칭 없음) | `src/hooks/use-firebase-sync.ts` |
| Make Money | SQLite | trades, orders, portfolio_snapshots, agent_logs, agent_state, ai_analysis_logs, signal_learning, team_decisions, orphaned_orders | `server/db.js` |
| OpenClaw (코딩봇) | SQLite | history, scheduled_tasks, context_memory, bot_meta, conversation_messages, github_events, forwarded_events, approval_requests, makemoney_health_events | `db.py` |
| Mission Control | Supabase | (설정 파일 없음) | `(없음)` |

---

## §8 최근 일기

### 2026-02-21 (6 세션)

1. 로드맵 잔여 작업 일괄 처리 + OpenClaw Phase 1 완료 + Navigator per-habit 트래킹
2. Codex 산출물 2건 검수 + 커밋 + push + 세션 마무리
3. Mission Control Vercel 배포 클라이언트 사이드 크래시 수정
4. Make Money Bot 전면 수정 — sync 무한루프 + PnL 보정 + 연속운영 + 저널 + 대시보드
5. Mission Control 대시보드 리뉴얼 — 8탭→5탭 축소 + OpenClaw→Watch Bot 리브랜딩
6. Mission Control 런타임 크래시 수정 (y.map is not a function)

### 2026-02-20 (14 세션)

1. AI 할루시네이션 방지 정직성 원칙 추가
2. Make Money 봇 안정성 + 수익성 종합 개선
3. Make Money 봇 시그널 가뭄 분석 + 전략 개선
4. OpenClaw 봇 Codex 프롬프트 4건 실행 + 검수 통합
5. OpenClaw 현황 진단 + 로드맵 작성, Codex 전프로젝트 변경사항 검수/커밋/push
6. Make Money 봇 라이브 복구 + 근본 안정성 수정 6건
7. HANDOFF-WEB 속도 문제 근본 해결 (11분→3초)
8. Make Money 대시보드 실시간 동기화 개선 + 규칙 enforcement 구조 개선
9. 포트폴리오 프로젝트 대규모 업데이트 (6→11개)
10. CLAUDE.md + AGENTS.md 규칙 문서 대규모 압축 (~2700→~290줄/세션)
11. 규칙 문서 압축 검증 + OpenClaw Make Money 헬스 모니터 코드 검수/커밋
12. Make Money 서버 사망 원인 분석 + WatchBot 자동 복구 배포 + 서버 재시작
13. 로드맵 체계 전면 정비 — Mission Control을 Source of Truth로
14. 로드맵 전체 할 일 정리 + OpenClaw 멀티봇/페르소나 확장 검토

### 2026-02-19 (7 세션)

1. 경로 마이그레이션 + 외부 도구 평가
2. HANDOFF-WEB 생성 + KM 시스템 설계
3. 자동 분배 규칙 + 도메인 맵 + 글로벌 설정 버전관리
4. 세션 인프라 전면 수정 + 워크플로우 통합
5. 텔레그램 개발 관제 시스템 구현
6. Make Money 봇 라이브 시작
7. SSH/WSL 작업환경 진단 + 문서 정확성 수정 + 세션 정리



---

## §9 기술 스택

| 프로젝트 | 주요 의존성 |
|---------|----------|
| X Article Editor | @google/generative-ai, @supabase/ssr, @supabase/supabase-js, @tiptap/extension-image, @tiptap/extension-placeholder, @tiptap/extension-strike, @tiptap/extension-underline, @tiptap/pm, @tiptap/react, @tiptap/starter-kit |
| 자산관리 (Web3 가계부) | @supabase/supabase-js, chart.js |
| Navigator (todolist) | firebase, playwright |
| Baby Care | date-fns, firebase, framer-motion, nanoid, next, react, react-dom, recharts |
| Kimchi Premium | python-telegram-bot, aiohttp, PyJWT, python-dotenv, supabase |
| Telegram Event Bot | python-telegram-bot, flask, python-dotenv, flask-limiter, supabase, pytest |
| Portfolio | framer-motion, react, react-dom |
| Text RPG (심연) | (없음) |
| Saitama Training | @tailwindcss/vite, firebase, react, react-dom, react-router-dom, tailwindcss, zustand |
| Make Money | (없음) |
| OpenClaw (코딩봇) | python-telegram-bot, python-dotenv, aiohttp |
| Mission Control | @supabase/ssr, @supabase/supabase-js, clsx, date-fns, lucide-react, next, react, react-dom, recharts, tailwind-merge |

---

## §10 알려진 에러

**전부 해결됨** -- 미해결 건 없음.

| ID | 에러 | 해결 방법 |
|----|------|----------|
| ERR-001 | better-sqlite3 플랫폼 바인딩 크래시 | Make Money 서버는 Windows에서만 실행 |
| ERR-002 | 한국어 경로 인코딩 깨짐 | NTFS junction `C:\vibe` 생성 + 전체 마이그레이션 (30+ 파일) |
| ERR-003 | PowerShell v5 vs v7 호환성 | `$env:OS -eq "Windows_NT"` 폴백 추가 |
| ERR-004 | WSL 심볼릭 링크 발산 | wsl-symlink-setup.sh로 심볼릭 링크 설정 |
| ERR-005 | Polymarket cancelOrder payload 형식 | polymarket.js payload 형식 수정 |
| ERR-006 | native module cross-platform mismatch | 각 실행 환경에서 별도 npm install |
| ERR-007 | sync-recovery 무한 임포트 루프 | `_syncBlacklist` Set에 EXPIRED_WORTHLESS/REDEEMABLE token_id 로드 + OPEN/CLOSED 24h 내 동일 token_id 체크 |
| ERR-008 | EXPIRED_WORTHLESS PnL 하드코딩 0 | `pnl = exitValue - entryCost` 계산 후 전달 + fix-expired-pnl.js로 기존 데이터 소급 보정 |
| ERR-009 | better-sqlite3 FK constraint DELETE 실패 | `PRAGMA foreign_keys = OFF` + DELETE FROM orders WHERE trade_id = ? 선행 실행 |


---

## §11 핵심 규칙 (Claude web 필독)

### 절대 금지
- `.env` 파일 수정/읽기/출력
- 한국어 경로 하드코딩 (`C:\Users\.박준희\...` 등)
- 검증 없이 "완료" 보고
- OpenClaw을 Windows에서 실행 / Make Money를 WSL에서 실행
- 존재하지 않는 API/함수 날조, 추측성 확신 표현

### Git 규칙
- Codex: commit/push 절대 금지 (Claude Code가 통합 처리)
- 커밋 형식: `feat:`, `fix:`, `refactor:` (한국어)
- push 전 repo-sweep 필수

### 검수 프로토콜
- 원본 요구사항 번호별로 O/X/triangle 표 작성
- 결과는 반드시 표로 정리
- Critical 0건 아니면 "완료" 금지

### 정직성 원칙
- 코드 제시 전 API/라이브러리 존재 여부 검증
- 불확실하면 `[불확실]` 태그 표시
- "아마 될 것입니다" 같은 추측성 확신 금지

### 핸드오프 6줄 (필수)
```
TASK-ID:
현재 상태:
수정 파일:
남은 작업:
리스크/주의점:
다음 실행 위치: (Windows / WSL / 둘 다)
```

---

## §12 Claude web에 요청할 때 참고

### 컨텍스트 전달 방법
1. 이 파일(`HANDOFF-WEB.md`) 첨부 (필수)
2. 구체적 요청 1줄
3. 필요 시 변경된 파일 2~3개 추가 첨부

### Claude web이 잘하는 것
- 코드베이스 전체 구조 감사 (수만 줄 일괄 분석)
- diff 검수 (변경 파일만 첨부)
- 새 엔진/기능/아키텍처 설계 자문
- 데이터 기반 수익성/성능 분석

### Claude web의 한계
- 파일 직접 접근 불가 (첨부만 가능)
- 세션 리셋 시 컨텍스트 유실
- 코드 실행/빌드 검증 불가

---

*Generated by handoff-generate.py on 2026-02-21 20:21 KST*
