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

## 멀티플랫폼 실행 컨텍스트 (공통)
- 이 프로젝트는 Windows 원본 파일 + WSL `/mnt/c/...` 동일 파일 접근 구조를 전제로 운영한다.
- 외부(노트북/모바일) 작업은 SSH -> WSL 경유가 기본이다.
- 실행 환경: **Windows 기본** (원격 접속 시 SSH -> WSL에서 편집 가능, 실행 제약은 프로젝트 규칙 우선)
- 경로 혼동 시 워크스페이스 `CLAUDE.md`의 "개발 환경 (멀티플랫폼)" 섹션을 우선 확인한다.
