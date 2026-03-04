# Mission Control

Workspace project control dashboard

## Features

- **Project Dashboard** — 11 project statuses at a glance (neglect warnings, category filters)
- **Activity Feed** — All-project commit unified timeline
- **Productivity Stats** — Streak, 7-day heatmap, per-project commit chart
- **Integration Status** — Inter-project integration status visualization
- **Detail Page** — Commit history, CHANGELOG, GitHub link, connected projects

## Stack

Next.js 16 + TypeScript + Tailwind CSS + GitHub API + Supabase

## Local Run

```bash
npm install
cp .env.example .env.local  # Set environment variables
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `GITHUB_TOKEN` | Recommended | GitHub Personal Access Token (60 requests/hour limit without it) |

## TODO: GitHub Token Setup

### 1. Issue Token
1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Note: `mission-control`
4. Expiration: desired period
5. Check only **`public_repo`** permission
6. **Generate token** -> copy it

### 2. Add Token to Vercel
1. Go to https://vercel.com -> click `mission-control` project
2. **Settings** -> **Environment Variables**
3. Add:
   - Key: `GITHUB_TOKEN`
   - Value: (copied token)
   - Environment: check **Production, Preview, Development** all
4. **Save**
5. **Deployments** -> latest deployment **...** -> **Redeploy**

## TODO: Next Tasks

- [ ] Issue GitHub Token + set Vercel environment variables (see above)
- [ ] Supabase snapshot storage (history tracking)
- [ ] Dark mode toggle
