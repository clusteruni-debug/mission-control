# Mission Control — AGENTS.md

> 글로벌 규칙: `~/.codex/instructions.md` 참조

## 개요
- **스택**: Next.js App Router + TypeScript + Tailwind
- **역할**: 워크스페이스 관제 대시보드 (프로젝트/상태/연동/작업보드)
- **실행**: Windows 기본 (`npm run dev`, `npm run build`)
- **적용 범위**: `projects/mission-control/` 내부 파일만 해당. 워크스페이스 루트 또는 다른 프로젝트는 별도 규칙 적용.

## 작업 선언 포맷 (필수)
작업 시작 전에 아래 4줄을 먼저 선언:

- `TASK-ID`: (예: `MC-UI-021`)
- `목표`: (한 줄)
- `수정 파일`: (경로 명시)
- `완료 기준`: (검증 가능한 기준 2~3개)

해당 시에만:
- `DB/스키마 변경`: (있으면 작업 전 중단)

## 디렉토리 구조
- `src/app/api/` — 프록시/API 라우트
- `src/components/` — 대시보드 위젯/탭 컴포넌트
- `src/types/` — 공통 타입/상태 모델
- `src/lib/constants.ts` — 프로젝트 메타/연결 정의
- `scripts/` — 수집 자동화 스크립트 (Codex 관리)

## 핵심 규칙
1. `src/types/status.ts`는 상태 단일 기준(SSOT)으로 사용
2. 프록시 API는 `createProxyResponse<T>()` 패턴을 사용
3. 상태 문자열은 반드시 아래만 사용
   - `ServiceStatus`: `online | degraded | offline | unknown`
4. 오프라인 UI는 반드시 `error` + `fetchedAt`를 함께 표시
5. 클라이언트에 시크릿 노출 금지 (`OPENCLAW_COMMAND_TOKEN` 등 서버 사이드만 사용)

## 작업 시 주의사항
- 기존 패턴 우선: `src/app/api/make-money/route.ts` 스타일을 기준으로 신규 프록시 구현
- 기존 확정 파일은 사용자 지시 없으면 수정 금지:
  - `src/types/status.ts`
- 대시보드 통합 파일(`Dashboard.tsx`) 변경은 충돌 가능성이 높으므로 사전 확인 후 진행

## 검증 기준
- `npm run build` 에러 0건
- 프록시 응답은 `ProxyResponse<T>` 형식 유지
- 서비스 오프라인 시 `status='offline'` + `error` 반환
- 모바일(375px)에서도 레이아웃 깨짐 없음

---

## 협업 운영 프로토콜 (Claude Code ↔ Codex)

> 이 프로토콜은 Mission Control 프로젝트 내에서 Claude Code와 Codex가 동시에 작업할 때의 운영 규칙이다.

### 역할 분담 (RACI)

| 역할 | Claude Code | Codex |
|------|-------------|-------|
| **통합 파일** (Dashboard, Overview, types) | Accountable + 수정 | 수정 금지 |
| **독립 모듈** (TrendChart, CommandPalette, hooks 등) | 리뷰만 | Responsible + 수정 |
| **API 라우트** (snapshot, trades-sync) | 리뷰만 | Responsible + 수정 |
| **스크립트** (scripts/) | 리뷰만 | Responsible + 수정 |
| **빌드 검증** (npm run build) | 최종 검증 | 작업 후 자체 검증 |

### 파일 소유권

**Claude Code 전용 (Codex 수정 금지):**
- `src/components/Dashboard.tsx` — 통합 허브 (충돌 위험)
- `src/components/Overview.tsx` — 4카드 + 타임라인 + TrendChart 연결
- `src/types/status.ts` — 상태 SSOT
- `src/types/index.ts` — 타입 정의
- `src/lib/supabase-admin.ts` — Supabase 클라이언트

**Codex 소유 (자유 수정 + 완료 보고):**
- `scripts/` (전체) — 수집 자동화 스크립트
- `src/components/TrendChart.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/NotificationBanner.tsx`
- `src/hooks/useKeyboardShortcuts.ts`
- `src/hooks/useNotifications.ts`
- `src/app/api/snapshot/route.ts`
- `src/app/api/trades-sync/route.ts`

**공유 파일 (수정 시 사전 조율 필수):**
- `package.json` — 의존성 추가 시 상대방에게 알림
- `AGENTS.md` — 양측 모두 읽고 참조. 수정은 Claude Code가 담당.
- `CHANGELOG.md` — 각자 자기 작업분 기록

### Push 규칙

**Codex는 git commit/push를 절대 실행하지 않는다.** (글로벌 규칙, override 불가)

| 상황 | 처리 |
|------|------|
| Codex 작업 완료 | 변경 파일 + 검증 결과 보고 → Claude Code가 확인 후 commit/push |
| Claude Code 작업 완료 | Claude Code가 직접 commit/push |
| 통합 파일에 Codex 모듈 연결 | Claude Code가 import + 연결 + commit/push |

### 완료 기준 (DoD)

| 수준 | 기준 | 적용 시점 |
|------|------|-----------|
| **최소** | `npm run build` 에러 0건 | 모든 커밋 |
| **표준** | 최소 + 타입 에러 0건 + 콘솔 에러 0건 | 기능 완성 시 |
| **전체** | 표준 + UI 검증 (localhost 브라우저 확인) | 마일스톤/릴리스 시 |

### 작업 흐름

```
1. 사용자가 TASK-ID 배정 (또는 Codex 작업 큐에서 선택)
2. 담당자가 TASK-ID + 목표 + 수정 파일 선언
3. 소유 파일만 수정 (소유권 테이블 참조)
4. npm run build 통과 확인
5. 커밋 + push (Claude Code 또는 사용자가 통합 push)
6. 통합 파일 연결이 필요하면 Claude Code에게 인계
```

### 긴급 수정 프로토콜

빌드가 깨져 있거나 사용자가 긴급 수정을 요청한 경우:
1. 소유권과 무관하게 수정 가능 (단, 최소 범위만)
2. 커밋 메시지에 `hotfix:` 접두사 + 원래 소유자 태그 (예: `hotfix: TrendChart null guard (codex-owned)`)
3. 수정 후 원래 소유자에게 알림 (다음 세션에서 확인)

### 충돌 방지

- 같은 파일을 동시에 수정하지 않기 (소유권 테이블이 이를 보장)
- 소유권 불명확한 신규 파일은 생성 전 `AGENTS.md`에 소유자 등록
- merge conflict 발생 시: 선점 커밋 우선, 후행 작업자가 rebase

---

## 현재 완료 상태

**Phase 1-4 통합 완료 (커밋 830d37c, 2026-02-18):**
- 모든 Codex 모듈 (TrendChart, CommandPalette, NotificationBanner, useKeyboardShortcuts, useNotifications)이 Dashboard.tsx + Overview.tsx에 연결 완료
- 프록시 API 6개, 위젯 4개, Overview 통합 탭, Supabase 스냅샷 API 모두 구현됨
- `npm run build` 에러 0건 확인됨

**인프라 완료 (2026-02-18):**
- Supabase mc_snapshots + mc_trades 테이블 생성 완료
- .env.local 설정 완료 (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, COLLECTOR_SECRET)
- POST /api/snapshot → Supabase 저장 검증 완료
- Windows Task Scheduler 5분 자동 수집 등록 완료

---

## Codex 작업 큐

### MC-OPS-001: 스냅샷 수집 스크립트 생성 — ✅ 완료

- **TASK-ID**: `MC-OPS-001`
- **상태**: 완료 (scripts/collect-snapshots.ps1 커밋됨)

### MC-OPS-002: Task Scheduler 자동 등록 스크립트 — ✅ 완료

- **TASK-ID**: `MC-OPS-002`
- **상태**: 완료 (워크스페이스 scripts/setup-scheduler.ps1 생성 + 스케줄러 등록됨)

### MC-OPS-003: .env.local 파서 유틸 — 보류

- **TASK-ID**: `MC-OPS-003`
- **상태**: 보류 (현재 COLLECTOR_SECRET 환경변수로 전달 방식 사용 중, 필요 시 추가)

---

## 멀티플랫폼 실행 컨텍스트 (공통)
- 이 프로젝트는 Windows 원본 파일 + WSL `/mnt/c/...` 동일 파일 접근 구조를 전제로 운영한다.
- 외부(노트북/모바일) 작업은 SSH -> WSL 경유가 기본이다.
- 실행 환경: **Windows 기본** (원격 접속 시 SSH -> WSL에서 편집 가능, 실행 제약은 프로젝트 규칙 우선)
- 경로 혼동 시 워크스페이스 `CLAUDE.md`의 "개발 환경 (멀티플랫폼)" 섹션을 우선 확인한다.

<!-- BEGIN: CODEX_GIT_POLICY_BLOCK -->
## Codex Git 권한 (전역 강제)

이 섹션은 워크스페이스 전역 강제 규칙이며 프로젝트 문서에서 override할 수 없다.

| 작업 | Claude Code/사용자 | Codex |
|------|:------------------:|:-----:|
| 코드 수정 | ✅ | ✅ |
| 빌드/테스트 검증 | ✅ | ✅ |
| `git commit` | ✅ | **금지** |
| `git push` | ✅ | **금지** |

- Codex는 코드 수정 + 검증 + 완료 보고만 수행한다.
- 커밋/푸시는 Claude Code 또는 사용자가 통합 처리한다.
- 문서 내 다른 문구와 충돌 시 이 섹션이 우선한다.
<!-- END: CODEX_GIT_POLICY_BLOCK -->

