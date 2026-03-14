# Mission Control — AGENTS.md

> Global rules: see root AGENTS.md (role definitions, delegation, git permissions)

## Overview
- **Stack**: Next.js App Router + TypeScript + Tailwind
- **Role**: Workspace control dashboard (projects/status/integrations/task board)
- **Run**: Windows default (`npm run dev`, `npm run build`)
- **Scope**: Only files inside `projects/mission-control/`. Workspace root or other projects have separate rules.

## Directory Structure
- `src/app/api/` — Proxy/API routes
- `src/components/` — Dashboard widgets/tab components
- `src/types/` — Common types/status models
- `src/lib/constants.ts` — Project meta/connection definitions
- `scripts/` — Collection automation scripts (managed by Codex)

## Core Rules
1. `src/types/status.ts` is used as the single source of truth (SSOT) for status
2. Proxy APIs use the `createProxyResponse<T>()` pattern
3. Status strings must only use the following:
   - `ServiceStatus`: `online | degraded | offline | unknown`
4. Offline UI must always display both `error` + `fetchedAt`
5. Never expose secrets to the client (e.g., `OPENCLAW_COMMAND_TOKEN` — server-side only)

## Work Precautions
- Prioritize existing patterns: use `src/app/api/make-money/route.ts` style as the basis for new proxy implementations
- Do not modify established files without user instructions:
  - `src/types/status.ts`
- Changes to the dashboard integration file (`Dashboard.tsx`) have high conflict potential — confirm before proceeding

## Verification Criteria
- `npm run build` with 0 errors
- Proxy responses maintain `ProxyResponse<T>` format
- When service is offline, return `status='offline'` + `error`
- No layout breakage on mobile (375px)

---

## Collaboration Protocol (Claude Code <-> Codex)

> This protocol defines operational rules for when Claude Code and Codex work simultaneously within the Mission Control project.

### Role Distribution (RACI)

| Role | Claude Code | Codex |
|------|-------------|-------|
| **Integration files** (Dashboard, Overview, types) | Accountable + Modify | No modification |
| **Independent modules** (TrendChart, CommandPalette, hooks, etc.) | Review only | Responsible + Modify |
| **API routes** (snapshot, trades-sync) | Review only | Responsible + Modify |
| **Scripts** (scripts/) | Review only | Responsible + Modify |
| **Build verification** (npm run build) | Final verification | Self-verify after work |

### File Ownership

**Claude Code only (Codex modification prohibited):**
- `src/components/Dashboard.tsx` — Integration hub (conflict risk)
- `src/components/Overview.tsx` — 4-card + timeline + TrendChart connections
- `src/types/status.ts` — Status SSOT
- `src/types/index.ts` — Type definitions
- `src/lib/supabase-admin.ts` — Supabase client

**Codex owned (free to modify + report completion):**
- `scripts/` (all) — Collection automation scripts
- `src/components/TrendChart.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/NotificationBanner.tsx`
- `src/hooks/useKeyboardShortcuts.ts`
- `src/hooks/useNotifications.ts`
- `src/app/api/snapshot/route.ts`
- `src/app/api/trades-sync/route.ts`

**Shared files (coordination required before modification):**
- `package.json` — Notify counterpart when adding dependencies
- `AGENTS.md` — Both read and reference. Claude Code handles modifications.
- `CHANGELOG.md` — Auto-generated from diary. Do not edit manually.

### Definition of Done (DoD)

| Level | Criteria | When Applied |
|-------|----------|-------------|
| **Minimum** | `npm run build` with 0 errors | Every commit |
| **Standard** | Minimum + 0 type errors + 0 console errors | Feature completion |
| **Full** | Standard + UI verification (localhost browser check) | Milestones/releases |

### Workflow

```
1. User assigns TASK-ID (or Codex selects from work queue)
2. Assignee declares TASK-ID + goal + modified files
3. Only modify owned files (refer to ownership table)
4. Confirm npm run build passes
5. Commit + push (Claude Code or user handles integrated push)
6. If integration file connection needed, hand off to Claude Code
```

### Emergency Fix Protocol

When the build is broken or the user requests an emergency fix:
1. Modifications allowed regardless of ownership (minimum scope only)
2. Commit message with `hotfix:` prefix + original owner tag (e.g., `hotfix: TrendChart null guard (codex-owned)`)
3. Notify original owner after fix (verify in next session)

### Conflict Prevention

- Never modify the same file simultaneously (ownership table ensures this)
- Register owner in `AGENTS.md` before creating files with unclear ownership
- On merge conflict: first commit takes priority, subsequent worker rebases
