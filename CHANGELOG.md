# Mission Control — CHANGELOG

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
