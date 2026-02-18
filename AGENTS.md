# Mission Control — AGENTS.md

> 글로벌 규칙: `~/.codex/instructions.md` 참조

## 개요
- **스택**: Next.js App Router + TypeScript + Tailwind
- **역할**: 워크스페이스 관제 대시보드 (프로젝트/상태/연동/작업보드)
- **실행**: Windows 기본 (`npm run dev`, `npm run build`)

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

## 현재 완료 상태

**Phase 1-4 통합 완료 (커밋 830d37c, 2026-02-18):**
- 모든 Codex 모듈 (TrendChart, CommandPalette, NotificationBanner, useKeyboardShortcuts, useNotifications)이 Dashboard.tsx + Overview.tsx에 연결 완료
- 프록시 API 6개, 위젯 4개, Overview 통합 탭, Supabase 스냅샷 API 모두 구현됨
- `npm run build` 에러 0건 확인됨

---

## Codex 작업 큐

### MC-OPS-001: 스냅샷 수집 스크립트 생성

- **TASK-ID**: `MC-OPS-001`
- **목표**: 5분마다 POST /api/snapshot을 호출하는 PowerShell 수집 스크립트 생성
- **수정 파일**: `scripts/collect-snapshots.ps1` (신규)
- **완료 기준**:
  1. `pwsh scripts/collect-snapshots.ps1` 실행 시 POST /api/snapshot 호출 성공
  2. 로그를 `$env:TEMP\vibe-coding-logs\collector.log`에 남김
  3. 인증: `Authorization: Bearer $COLLECTOR_SECRET` 헤더 포함
  4. 에러 시 로그에 기록하고 비정상 종료하지 않음 (스케줄러가 다음 실행)

**구현 참고:**
```powershell
# 호출 대상: http://localhost:3000/api/snapshot
# 인증: Bearer 토큰 (.env.local의 COLLECTOR_SECRET)
# 로그: $env:TEMP\vibe-coding-logs\collector.log (append)
# 타임스탬프 포함, 응답 status 기록
```

### MC-OPS-002: Task Scheduler 자동 등록 스크립트

- **TASK-ID**: `MC-OPS-002`
- **목표**: collect-snapshots.ps1을 Windows Task Scheduler에 5분 간격으로 등록하는 헬퍼 스크립트
- **수정 파일**: `scripts/setup-scheduler.ps1` (신규)
- **완료 기준**:
  1. 관리자 권한으로 실행 시 "VibeCoding-MC-Collector" 작업 등록
  2. 5분 반복, 무기한 지속
  3. 이미 등록되어 있으면 업데이트
  4. 등록 결과를 콘솔에 출력

**구현 참고:**
```powershell
# Task 이름: VibeCoding-MC-Collector
# 트리거: 5분 반복 (RepetitionInterval)
# 액션: pwsh -File <script-path>/collect-snapshots.ps1
# 환경변수 COLLECTOR_SECRET는 스크립트 내에서 .env.local 파싱 or 인자로 전달
```

### MC-OPS-003: .env.local 파서 유틸 (선택)

- **TASK-ID**: `MC-OPS-003`
- **목표**: collect-snapshots.ps1이 .env.local에서 COLLECTOR_SECRET을 자동 읽도록 파서 함수 포함
- **수정 파일**: `scripts/collect-snapshots.ps1` 내 함수로 포함
- **완료 기준**: .env.local 파일에서 KEY=VALUE 파싱, `#` 주석 무시, 빈 줄 무시

---

## 수정 금지 파일 (Codex)

아래 파일은 Claude Code가 관리 중이므로 Codex는 수정하지 말 것:
- `src/components/Dashboard.tsx` — 통합 허브 (충돌 위험)
- `src/components/Overview.tsx` — 4카드 + 타임라인 + TrendChart 연결
- `src/types/status.ts` — 상태 SSOT
- `src/types/index.ts` — 타입 정의
- `src/lib/supabase-admin.ts` — Supabase 클라이언트

## Codex 수정 가능 파일

- `scripts/` (전체) — 신규 스크립트
- `src/components/TrendChart.tsx` — Codex 소유
- `src/components/CommandPalette.tsx` — Codex 소유
- `src/components/NotificationBanner.tsx` — Codex 소유
- `src/hooks/useKeyboardShortcuts.ts` — Codex 소유
- `src/hooks/useNotifications.ts` — Codex 소유
- `src/app/api/snapshot/route.ts` — Codex 소유
- `src/app/api/trades-sync/route.ts` — Codex 소유

---

## Codex 작업 지시: MC-OPS-002 — 스냅샷 수집 스크립트

> **TASK-ID**: MC-OPS-002
> **목표**: `scripts/collect-snapshots.ps1` 작성 — Windows 작업 스케줄러에서 5분 간격 실행
> **수정 파일**: `scripts/collect-snapshots.ps1` (신규)
> **완료 기준**: (1) 스크립트 실행 시 POST 2건 호출 성공 (2) 로그 파일 정상 기록 (3) 에러 시 종료코드 0 유지 (스케줄러 안정성)

### 스펙

```powershell
# scripts/collect-snapshots.ps1
# 역할: POST /api/snapshot + POST /api/trades-sync 호출 (5분 스케줄러용)
# 인증: COLLECTOR_SECRET 환경변수 → Bearer 토큰
# 로그: $env:TEMP\vibe-coding-logs\collector.log (append, 타임스탬프 포함)
# 에러 처리: HTTP 실패/타임아웃 시 로그에 기록하되 exit 0 유지

# 필수 동작:
# 1. $env:COLLECTOR_SECRET 없으면 경고 로그 + exit 0
# 2. $baseUrl = "http://localhost:3000" (환경변수 MC_BASE_URL로 오버라이드 가능)
# 3. POST $baseUrl/api/snapshot (Authorization: Bearer $secret)
# 4. POST $baseUrl/api/trades-sync (Authorization: Bearer $secret)
# 5. 각 호출 결과 (status code, response time) 로그
# 6. 로그 디렉토리 자동 생성 (New-Item -ItemType Directory -Force)
# 7. 로그 파일 100MB 초과 시 자동 로테이션 (rename + 새 파일)
```

### 작업 스케줄러 등록 방법 (참고용, 스크립트 안에 주석으로 포함)

```powershell
# 등록:
# schtasks /create /tn "MissionControl-Collector" /tr "powershell -ExecutionPolicy Bypass -File C:\Users\.박준희\Desktop\바이브코딩\projects\mission-control\scripts\collect-snapshots.ps1" /sc minute /mo 5 /f
# 해제:
# schtasks /delete /tn "MissionControl-Collector" /f
```

### 수정 금지 파일
- `src/app/api/snapshot/route.ts` — 이미 완성됨
- `src/app/api/trades-sync/route.ts` — 이미 완성됨
- `src/lib/supabase-admin.ts` — 이미 완성됨

---

## 멀티플랫폼 실행 컨텍스트 (공통)
- 이 프로젝트는 Windows 원본 파일 + WSL `/mnt/c/...` 동일 파일 접근 구조를 전제로 운영한다.
- 외부(노트북/모바일) 작업은 SSH -> WSL 경유가 기본이다.
- 실행 환경: **Windows 기본** (원격 접속 시 SSH -> WSL에서 편집 가능, 실행 제약은 프로젝트 규칙 우선)
- 경로 혼동 시 워크스페이스 `CLAUDE.md`의 "개발 환경 (멀티플랫폼)" 섹션을 우선 확인한다.
