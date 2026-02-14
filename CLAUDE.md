# Mission Control

> 워크스페이스 프로젝트 관제 대시보드

## 스택

- **프레임워크**: Next.js 16 (App Router, Turbopack)
- **언어**: TypeScript
- **스타일**: Tailwind CSS 4
- **아이콘**: Lucide React
- **백엔드**: Supabase (스냅샷 저장용, 미사용 상태)
- **데이터 소스**: GitHub API (public repos)

## 구조

```
src/
├── app/
│   ├── page.tsx              # Dashboard 진입점
│   ├── layout.tsx            # 레이아웃 (Geist 폰트, 다크모드)
│   ├── globals.css           # Tailwind 글로벌
│   ├── api/
│   │   ├── scan/route.ts     # 전체 프로젝트 스캔 API
│   │   ├── scan/[folder]/    # 개별 프로젝트 상세 API
│   │   └── feed/route.ts     # 통합 활동 피드 API
│   └── project/[folder]/     # 프로젝트 상세 페이지
├── components/
│   ├── Dashboard.tsx         # 메인 대시보드 (탭 4개)
│   ├── ProjectCard.tsx       # 프로젝트 카드 (건강 상태 뱃지)
│   ├── StatsBar.tsx          # 상단 통계 바
│   ├── ActivityFeed.tsx      # 커밋 타임라인 (날짜별 그룹)
│   ├── ProductivityStats.tsx # 생산성 차트 (streak + 히트맵)
│   └── ConnectionMap.tsx     # 프로젝트 연동 관계도
├── lib/
│   ├── constants.ts          # 프로젝트 목록 + 카테고리 정의
│   ├── github.ts             # GitHub API 호출 + 스캔 로직
│   ├── supabase.ts           # Supabase 클라이언트 (미사용)
│   └── utils.ts              # cn(), formatRelativeDate()
└── types/
    └── index.ts              # 공유 타입 정의
```

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

## 환경변수

```bash
# .env.local 필요
GITHUB_TOKEN=          # GitHub API 토큰 (없으면 시간당 60회 제한)
NEXT_PUBLIC_SUPABASE_URL=     # Supabase (현재 미사용)
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase (현재 미사용)
```

## 주의사항

- `constants.ts`에 프로젝트 추가/수정 시 워크스페이스 CLAUDE.md도 동기화
- GitHub API rate limit: 토큰 없으면 60회/시간, 있으면 5000회/시간
- `next: { revalidate: 300 }` — API 응답 5분 캐시
- Supabase는 아직 미사용 (향후 스냅샷 히스토리 저장용)
