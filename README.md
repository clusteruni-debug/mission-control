# Mission Control

워크스페이스 프로젝트 관제 대시보드

## 기능

- **프로젝트 대시보드** — 11개 프로젝트 상태 한눈에 (방치 경고, 카테고리 필터)
- **활동 피드** — 전체 프로젝트 커밋 통합 타임라인
- **생산성 통계** — streak, 7일 히트맵, 프로젝트별 커밋 차트
- **연동 현황** — 프로젝트 간 연동 상태 시각화
- **상세 페이지** — 커밋 히스토리, CHANGELOG, GitHub 링크, 연동 프로젝트

## 스택

Next.js 16 + TypeScript + Tailwind CSS + GitHub API + Supabase

## 로컬 실행

```bash
npm install
cp .env.example .env.local  # 환경변수 설정
npm run dev
```

## 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | O | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O | Supabase anon key |
| `GITHUB_TOKEN` | 권장 | GitHub Personal Access Token (없으면 60회/시간 제한) |

## TODO: GitHub Token 설정

### 1. 토큰 발급
1. https://github.com/settings/tokens 접속
2. **Generate new token (classic)** 클릭
3. Note: `mission-control`
4. Expiration: 원하는 기간
5. **`public_repo`** 권한만 체크
6. **Generate token** → 복사해두기

### 2. Vercel에 토큰 추가
1. https://vercel.com → `mission-control` 프로젝트 클릭
2. **Settings** → **Environment Variables**
3. 추가:
   - Key: `GITHUB_TOKEN`
   - Value: (복사한 토큰)
   - Environment: **Production, Preview, Development** 전부 체크
4. **Save**
5. **Deployments** → 최신 배포 **⋮** → **Redeploy**

## TODO: 다음 작업

- [ ] GitHub Token 발급 + Vercel 환경변수 설정 (위 참고)
- [ ] Supabase 스냅샷 저장 (히스토리 추적)
- [ ] 다크모드 토글
