# Vibe Coding Workspace — Claude Web Handoff

> **Auto-generated**: 2026-03-06 01:34 KST
> **Purpose**: Share with Claude.ai web to transfer full workspace context

---

## §1 Workspace Overview

| Item | Value |
|------|-------|
| **Name** | Vibe Coding |
| **Owner** | Solo developer (clusteruni-debug GitHub org) |
| **Structure** | Multi-project monorepo (15 projects) |
| **Main PC** | Windows 11 + WSL2 (Ubuntu 24.04) |
| **Paths** | `C:\vibe` (Windows) / `/mnt/c/vibe` (WSL) -- NTFS junction |
| **Remote** | SSH -> Tailscale -> WSL (continue work from laptop/phone) |
| **AI Agents** | 3-Agent: Claude Code (impl), Codex (parallel exec), Claude Web (design/review) |

### 4-Space Structure

| Space | Path | Purpose |
|-------|------|---------|
| **active** | `projects/<name>/` | 15 active projects |
| **docs** | `docs/plans/`, `docs/guides/` | Guides, plans, ops docs |
| **archive** | `archive/` | Legacy files (move instead of delete) |
| **memory** | `memory/` | Cross-session context persistence |

### Document Priority Chain (highest first)

1. Project `AGENTS.md` -- file domains, execution rules
2. Project `CLAUDE.md` -- project-specific rules
3. Root `AGENTS.md` -- inter-agent common protocol
4. Root `CLAUDE.md` -- workspace common rules
5. `~/.claude/CLAUDE.md` -- global rules

---

## §2 Project Status

| # | Project | Stack | Deploy | Latest Commit | Days Ago |
|---|---------|-------|--------|--------------|----------|
| 1 | **X Article Editor** | Next.js 16 + TS + Supabase + TipTap | Vercel | feat: Knowledge Connection — quick capture, stale reminders, selection insight, related sidebar | 0d |
| 2 | **Asset Manager** | Vite + Vanilla JS + Supabase + Chart.js | Vercel | chore: add .gitattributes for LF line ending normalization | 1d |
| 3 | **Navigator (todolist)** | HTML + Vanilla JS + Firebase | GitHub Pages | feat: 완료 작업 수정 + 히스토리 기록 일괄 삭제 | 0d |
| 4 | **Baby Care** | Next.js 16 + TS + Firebase | Vercel | chore: add .gitattributes for LF line ending normalization | 1d |
| 5 | **Kimchi Premium** | React + Vite + WebSocket | Local | docs: add HANDOFF-WEB.md for project context | 0d |
| 6 | **Telegram Event Bot** | Python + Flask + Supabase | Local | docs: regenerate HANDOFF-WEB.md via handoff-generate.py | 0d |
| 7 | **Portfolio** | Vite + React + TS + Tailwind + Framer | GitHub Pages | chore: add .gitattributes for LF line ending normalization | 1d |
| 8 | **Text RPG** | Vite + Vanilla JS | Local | chore: add .gitattributes for LF line ending normalization | 1d |
| 9 | **Saitama Training** | React + TS + Firebase + zustand | Vercel | chore: add .gitattributes for LF line ending normalization | 1d |
| 10 | **Make Money** | Node.js + Express + SQLite + Claude AI | Local | fix: sports-live-score 유동성 바이패스 + 시그널 트래킹 강화 + 튜닝 거버넌스 | 0d |
| 11 | **OpenClaw Gateway** | OpenClaw framework + Node.js | WSL systemd | docs: simplify CLAUDE.md — replace retired WatchBot section with systemd note | 0d |
| 12 | **Mission Control** | Next.js 16 + TS + Tailwind v4 | Vercel | feat: Phase 2 Enhanced Intelligence — incidents, dependency impact, alerting, deep monitoring | 0d |
| 13 | **AI Hub** | Electron + Vanilla JS + Supabase | Local | chore: add .gitattributes for LF line ending normalization | 1d |
| 14 | **AI Hub Extension** | Chrome Extension MV3 + Supabase | Chrome Web Store | chore: add .gitattributes for LF line ending normalization | 1d |
| 15 | **TradingLab** | Python + pandas + pydantic | Local | docs: add HANDOFF-WEB.md for project context | 0d |

---

## §3 Recent Activity (7 days)

| Project | Commits | Latest Change |
|---------|---------|---------------|
| **X Article Editor** | 4 | feat: Knowledge Connection — quick capture, stale reminders, selection insight, related sidebar |
| **Asset Manager** | 7 | chore: add .gitattributes for LF line ending normalization |
| **Navigator (todolist)** | 8 | feat: 완료 작업 수정 + 히스토리 기록 일괄 삭제 |
| **Baby Care** | 3 | chore: add .gitattributes for LF line ending normalization |
| **Kimchi Premium** | 10 | docs: add HANDOFF-WEB.md for project context |
| **Telegram Event Bot** | 55 | docs: regenerate HANDOFF-WEB.md via handoff-generate.py |
| **Portfolio** | 5 | chore: add .gitattributes for LF line ending normalization |
| **Text RPG** | 4 | chore: add .gitattributes for LF line ending normalization |
| **Saitama Training** | 3 | chore: add .gitattributes for LF line ending normalization |
| **Make Money** | 24 | fix: sports-live-score 유동성 바이패스 + 시그널 트래킹 강화 + 튜닝 거버넌스 |
| **OpenClaw Gateway** | 5 | docs: simplify CLAUDE.md — replace retired WatchBot section with systemd note |
| **Mission Control** | 12 | feat: Phase 2 Enhanced Intelligence — incidents, dependency impact, alerting, deep monitoring |
| **AI Hub** | 15 | chore: add .gitattributes for LF line ending normalization |
| **AI Hub Extension** | 3 | chore: add .gitattributes for LF line ending normalization |
| **TradingLab** | 20 | docs: add HANDOFF-WEB.md for project context |

---

## §4 Active Tasks

| TASK-ID | Owner | Status | Scope | Notes |
|---------|-------|--------|-------|-------|
| TGBOT-INV-20260303-01 | codex | review | AGENT_TASK_BOARD.md, projects/telegram-event-bot/{bot_classify.py,web.py,routes_*.py} | Root cause confirmed: `TELEGRAM_BOT_TOKEN` missing in Vercel caused import crash |
| SPLIT2-MM-05 | claude-code | todo | projects/make-money-project/server/{agent,db}.js, projects/make-money-project/server/engines/{crypto-universal-engine,crypto-ai-analyst}.js | agent.js 4795→7 modules, engine 3151→7, analyst 2839→5, db 1402→5. **Live bot: z |


---

## §5 Blockers/Risks

- Make Money: MATIC ~0, on-chain claims require manual intervention
- CRLF normalization: 2/15 repos not pushed (Saitama-training, portfolio — PAT missing `workflow` scope)

---

## §6 Work In Progress

> Previous §6 content archived: `archive/HANDOFF-WEB-S6-ARCHIVE-20260305.md`

### Make Money Bot (Active)
- **Strategy**: Sniper "Steady Growth", Balance ~$15.93, 5 engines (sports-focused, no crypto)
- **Budget**: $25 total / $0.25 daily AI limit
- **Waiting**: 30 RS post-tuning trades (currently 12) before next parameter adjustment
- **Blocker**: MATIC ~0, on-chain claims require manual intervention

### ACP Agents (Monitoring)
- 4 agents: GodtRiskOps, OrbitProof, GrandMaster, Sherlock
- All sellers running on WSL. Revenue mainly from token trading fees
- GodtRiskOps: 6 offerings, signature `rug_radar`

### Mission Control — Phase 1+2 Complete (2026-03-06)
- **Phase 1 Command & Control**: Services tab, pm2/systemd status, start/stop/restart, log viewer, 20 services
- **Phase 2 Enhanced Intelligence**: Incident Board (CRUD+auto-detect), Dependency Impact (blast radius), Telegram Alerting, Deep Monitoring (risk gauge+5-period win rate)
- **Next**: Set TELEGRAM_ALERT_CHAT_ID, Phase 3 (Automation — Agent Queue, Auto-Recovery, AI Summary)

### Planned (Not Started)
- **INTEG-PHASE2**: Asset Manager import API -> automated revenue/price sync
- **AGENT-QUEUE**: Autonomous AI Agent system (plan at `docs/plans/PLAN-AGENT-QUEUE.md`)

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

## §7 DB Schema Status

| Project | DB | Tables/Collections | Source File |
|---------|----|--------------------|-------------|
| X Article Editor | Supabase | (no source) | `supabase/schema.sql` |
| Asset Manager | Supabase | accounts, transactions, recurring_items, rpg_data | `supabase/schema.sql` |
| Navigator (todolist) | Firebase + localStorage | (no config file) | `(none)` |
| Baby Care | Firebase | (no source) | `lib/firebase/firestore.ts` |
| Kimchi Premium | Supabase | (no source) | `react-app/src/hooks/usePaperTrades.js` |
| Telegram Event Bot | Supabase | (no matches) | `database.py` |
| Saitama Training | Firebase | (no matches) | `src/hooks/use-firebase-sync.ts` |
| Make Money | SQLite | (no matches) | `server/db.js` |
| OpenClaw Gateway | SQLite | history, scheduled_tasks, context_memory, bot_meta, conversation_messages, github_events, forwarded_events, approval_requests, makemoney_health_events | `db.py` |
| Mission Control | Supabase | (no config file) | `(none)` |
| AI Hub | Supabase | (no config file) | `(none)` |
| AI Hub Extension | Supabase | (no config file) | `(none)` |

---

## §8 Recent Diary

### 2026-03-06 (10 sessions)

1. Session 1 (Claude Code, Opus 4.6)
2. Session 2 (Claude Code, Opus 4.6)
3. Session 2b (Claude Code, Opus 4.6)
4. Session 3 (Claude Code, Opus 4.6)
5. Session 3b (Claude Code, Opus 4.6)
6. Session 3c (Claude Code, Opus 4.6)
7. Session 4 (Claude Code, Opus 4.6)
8. Session 5 (Claude Code, Opus 4.6)
9. Session 6 (Claude Code, Opus 4.6)
10. Session 7 (Claude Code, Opus 4.6)

### 2026-03-05 (17 sessions)

1. Session 1 (Claude Code, Opus 4.6)
2. Session 2 (Claude Code, Opus 4.6)
3. Session 3 (Claude Code, Opus 4.6)
4. Session 4 (Claude Code, Opus 4.6)
5. Session 5 (Claude Code, Opus 4.6)
6. Session 6 (Claude Code, Opus 4.6)
7. Session 7 (Claude Code, Opus 4.6)
8. Session 8 (Claude Code, Opus 4.6)
9. Session 9 (Claude Code, Opus 4.6)
10. Session 10 (Claude Code, Opus 4.6)
11. Session 11 (Claude Code, Opus 4.6)
12. Session 12 (Claude Code, Opus 4.6)
13. Session 13 (Claude Code, Opus 4.6)
14. Session 14 (Claude Code, Opus 4.6)
15. Session 15 (Claude Code, Opus 4.6)
16. Session 16 (Claude Code, Opus 4.6)
17. Session 17 (Claude Code, Opus 4.6)

### 2026-03-04 (9 sessions)

1. Session 1 (Claude Code, Opus 4.6)
2. Session 2 (Claude Code, Opus 4.6)
3. Session 3 (Claude Code, Opus 4.6)
4. Session 4 (Claude Code, Opus 4.6)
5. Session 5 (Claude Code, Opus 4.6)
6. Session 6 (Claude Code, Opus 4.6)
7. Session 7 (Claude Code, Opus 4.6)
8. Session 8 (Claude Code, Opus 4.6)
9. Session 9 (Claude Code, Opus 4.6)



---

## §9 Tech Stack

| Project | Key Dependencies |
|---------|------------------|
| X Article Editor | @google/generative-ai, @supabase/ssr, @supabase/supabase-js, @tiptap/extension-image, @tiptap/extension-placeholder, @tiptap/extension-strike, @tiptap/extension-underline, @tiptap/pm, @tiptap/react, @tiptap/starter-kit |
| Asset Manager | @supabase/supabase-js, chart.js |
| Navigator (todolist) | firebase, playwright, serve |
| Baby Care | date-fns, firebase, framer-motion, nanoid, next, react, react-dom, recharts |
| Kimchi Premium | python-telegram-bot, aiohttp, PyJWT, python-dotenv, supabase |
| Telegram Event Bot | python-telegram-bot, flask, python-dotenv, flask-limiter, supabase, pytest |
| Portfolio | framer-motion, react, react-dom |
| Text RPG | (none) |
| Saitama Training | @tailwindcss/vite, firebase, react, react-dom, react-router-dom, tailwindcss, zustand |
| Make Money | (none) |
| OpenClaw Gateway | python-telegram-bot, python-dotenv, aiohttp |
| Mission Control | @supabase/ssr, @supabase/supabase-js, clsx, date-fns, lucide-react, next, react, react-dom, recharts, tailwind-merge |
| AI Hub | @supabase/supabase-js |
| AI Hub Extension | @supabase/supabase-js |
| TradingLab | (none) |

---

## §10 Known Errors

**All resolved** -- no unresolved issues.

| ID | Error | Resolution |
|----|-------|------------|
| ERR-001 | better-sqlite3 Platform Binding Crash |  |
| ERR-002 | Korean Path Encoding Breakage |  |
| ERR-003 | PowerShell v5 vs v7 Compatibility |  |
| ERR-004 | WSL Symbolic Link Divergence |  |
| ERR-005 | Polymarket cancelOrder Payload Format |  |
| ERR-006 | Native Module Cross-Platform Mismatch |  |
| ERR-007 | sync-recovery Infinite Import Loop |  |
| ERR-008 | EXPIRED_WORTHLESS PnL Hardcoded to 0 |  |
| ERR-009 | better-sqlite3 FK Constraint DELETE Failure |  |
| ERR-012 | WSL Symlink vs Windows Junction Incompatibility (Skill/Command Not Recognized) |  |
| ERR-013 | WSL ERROR_SHARING_VIOLATION -- WSL Fails to Start |  |
| ERR-011 | Vite JSX Transform Failure (NTFS Junction + fs.strict Conflict) |  |
| ERR-014 | Polymarket CLAIM On-chain Infinite Loop (Insufficient MATIC) |  |


---

## §11 Critical Rules (must-read for Claude web)

### Strictly Prohibited
- Modifying/reading/outputting `.env` files
- Hardcoding Korean paths (`C:\Users\.박준희\...` etc.)
- Reporting "done" without verification
- Running OpenClaw on Windows / Make Money on WSL
- Fabricating non-existent APIs/functions, speculative claims

### Git Rules
- Codex: never commit/push (Claude Code handles integration)
- Commit format: `feat:`, `fix:`, `refactor:`
- repo-sweep required before push

### Review Protocol
- Create O/X/triangle table per original requirement number
- Results must be organized in tables
- No "done" unless Critical count = 0

### Honesty Principle
- Verify API/library existence before presenting code
- Tag uncertain items with `[UNCERTAIN]`
- No speculative claims like "it should probably work"

### Handoff 6-liner (required)
```
TASK-ID:
Current status:
Modified files:
Remaining work:
Risks/caveats:
Next execution: (Windows / WSL / both)
```

---

## §12 Tips for Requesting via Claude Web

### How to Pass Context
1. Attach this file (`HANDOFF-WEB.md`) (required)
2. One specific request line
3. Attach 2-3 changed files if needed

### What Claude Web Does Well
- Full codebase structural audit (bulk analysis of tens of thousands of lines)
- Diff review (attach only changed files)
- Architecture/engine/feature design consultation
- Data-driven profitability/performance analysis

### Claude Web Limitations
- Cannot access files directly (attachment only)
- Context lost on session reset
- Cannot execute code/build verification

---

*Generated by handoff-generate.py on 2026-03-06 01:34 KST*
