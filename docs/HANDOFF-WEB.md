# Vibe Coding Workspace — Claude Web Handoff

> **Auto-generated**: 2026-02-24 11:57 KST
> **Purpose**: Share with Claude.ai web to transfer full context

---

## S1 Workspace Overview

| Item | Value |
|------|-------|
| **Name** | Vibe Coding |
| **Owner** | Solo developer (clusteruni-debug GitHub org) |
| **Structure** | Multi-project monorepo (12 projects) |
| **Main PC** | Windows 11 + WSL2 (Ubuntu 24.04) |
| **Path** | `C:\vibe` (Windows) / `/mnt/c/vibe` (WSL) -- NTFS junction |
| **Remote Access** | SSH -> Tailscale -> WSL (continue work from laptop/phone) |
| **AI Agents** | 3-Agent: Claude Code (implementation), Codex (parallel execution), Claude Web (design/review) |

### 4-Space Structure

| Space | Path | Purpose |
|-------|------|---------|
| **active** | `projects/<project-name>/` | 12 active projects |
| **docs** | `docs/plans/`, `docs/guides/` | Guides, plans, operational documents |
| **archive** | `archive/` | Legacy files (moved instead of deleted) |
| **memory** | `memory/` | Cross-session context retention |

### Core Document Chain (highest priority first)

1. Project `AGENTS.md` -- File domains, execution rules
2. Project `CLAUDE.md` -- Project-specific rules
3. Root `AGENTS.md` -- Common protocol between agents
4. Root `CLAUDE.md` -- Workspace common rules
5. `~/.claude/CLAUDE.md` -- Global rules

---

## S2 Project Status

| # | Project | Stack | Deployment | Latest Commit | Days Ago |
|---|---------|-------|------------|--------------|----------|
| 1 | **X Article Editor** | Next.js 16 + TS + Supabase + TipTap | Vercel | chore: delete unnecessary bat files + add .mcp.json to .gitignore | 1 |
| 2 | **Asset Manager (Web3 Ledger)** | Vite + Vanilla JS + Supabase + Chart.js | Vercel | chore: change vite port to 5140 (workspace port rule sync) | 2 |
| 3 | **Navigator (todolist)** | HTML + Vanilla JS + Firebase | GitHub Pages | chore: add .mcp.json to .gitignore | 1 |
| 4 | **Baby Care** | Next.js 16 + TS + Firebase | Vercel | chore: add .mcp.json to .gitignore | 1 |
| 5 | **Kimchi Premium** | React + Vite + WebSocket | Local | chore: add .mcp.json to .gitignore | 1 |
| 6 | **Telegram Event Bot** | Python + Flask + Supabase | Local | chore: add .mcp.json to .gitignore | 1 |
| 7 | **Portfolio** | Vite + React + TS + Tailwind + Framer | GitHub Pages | chore: specify vite port 5110 (workspace port rule sync) | 2 |
| 8 | **Text RPG (Abyss)** | Vite + Vanilla JS | Local | chore: change vite port to 5120 (workspace port rule sync) | 2 |
| 9 | **Saitama Training** | React + TS + Firebase + zustand | Vercel | chore: add .mcp.json to .gitignore | 1 |
| 10 | **Make Money** | Node.js + Express + SQLite + Claude AI | Local | fix: 3 dashboard bug fixes — closed position filtering, PnL supplement, date display | 0 |
| 11 | **OpenClaw (Coding Bot)** | Python + telegram-bot + Claude Agent SDK | WSL pm2 | docs: add OpenClaw git policy + WatchBot retirement record | 1 |
| 12 | **Mission Control** | Next.js 16 + TS + Tailwind v4 | Vercel | feat: add Quick Launch panel to Overview | 0 |

---

## S3 Recent Activity (7 days)

| Project | Commits | Latest Change |
|---------|---------|--------------|
| **X Article Editor** | 11 | chore: delete unnecessary bat files + add .mcp.json to .gitignore |
| **Asset Manager (Web3 Ledger)** | 10 | chore: change vite port to 5140 (workspace port rule sync) |
| **Navigator (todolist)** | 11 | chore: add .mcp.json to .gitignore |
| **Baby Care** | 12 | chore: add .mcp.json to .gitignore |
| **Kimchi Premium** | 11 | chore: add .mcp.json to .gitignore |
| **Telegram Event Bot** | 11 | chore: add .mcp.json to .gitignore |
| **Portfolio** | 11 | chore: specify vite port 5110 (workspace port rule sync) |
| **Text RPG (Abyss)** | 9 | chore: change vite port to 5120 (workspace port rule sync) |
| **Saitama Training** | 13 | chore: add .mcp.json to .gitignore |
| **Make Money** | 106 | fix: 3 dashboard bug fixes — closed position filtering, PnL supplement, date display |
| **OpenClaw (Coding Bot)** | 40 | docs: add OpenClaw git policy + WatchBot retirement record |
| **Mission Control** | 30 | feat: add Quick Launch panel to Overview |

---

## S4 Active Tasks

| TASK-ID | Owner | Status | Target | Notes |
|---------|-------|--------|--------|-------|
| - | - | - | - | - |


---

## S5 Blockers/Risks

None (ERROR-BOOK unresolved items: 0).

---

## S6 In-Progress Work

### 6-1. OpenClaw Bot -- Pattern Porting Based Large-Scale Upgrade

**Strategic Background**: Instead of installing the official OpenClaw framework (Node.js, 140K+ GitHub stars), extracting only necessary design patterns from MIT-licensed source and porting to existing Python bot (python-telegram-bot v22 + Claude Agent SDK). See S5 security risks for reasoning.

**Goal**: Coding dispatcher -> Personal operations agent transition

**Architecture Change Highlights:**

#### A. Multi-Agent Routing (bot.py)
- `/code <message>` -> Claude agent (analysis, strategy, writing, crypto monitoring)
- `/codex <message>` -> Codex agent (code writing, debugging, build, DB work)
- `/triangle` -> Codex implementation -> Claude review (with auto-fix)
- `/duet` -> Codex <-> Claude ping-pong (implement->comment->reflect->build check)
- `/auto` -> Claude autonomous plan (JSON) -> step-by-step Codex/Claude auto-execution
- No prefix -> Brain (Claude Agent SDK) natural language processing default routing
- Claude: Agent SDK (`claude-agent-sdk 0.1.38`) invocation
- Codex: `codex exec` CLI direct invocation (runner.py)

#### B. Workspace File Loading (brain.py)
- OpenClaw `bootstrap-files.ts` pattern -> Python port
- Auto-load SOUL.md, USER.md, AGENTS.md, TOOLS.md from `workspace/` directory
- System prompt transitioned from personas.py hardcoding -> file-based dynamic configuration
- 65,536 char limit per file, graceful fallback to existing hardcoding if file missing

#### C. Workspace File Design

**SOUL.md (Shared Agent Tone)**:
- Conclusion first, background only on request
- Explicitly state "uncertain" for unverified information
- No ceremonial greetings (existing QUICK_RESPONSES tone down, preserved as fallback)
- Emojis allowed only for status indicators
- Never present speculation as fact

**SOUL-codex.md (Codex-Specific Persona)**: Codex-only tone (code-centric, problem redefinition->code->explanation style). Implemented in CCB-017, pending review.

**USER.md**: User context (crypto monitoring 50-60 Telegram channels, vibe coding solo developer)

**AGENTS.md**: Group chat @mention required, Heartbeat 30min (existence check only), file manipulation safety rules

**TOOLS.md**: WSL Ubuntu-ssh, Tailscale VPN, PM2 process management, project paths

#### D. Skill System (brain.py skill loader)
- Scan `workspace/skills/<name>/SKILL.md` -> inject only Available Skills list into prompt
- Agent reads SKILL.md body on demand
- Lightweight skill manifest pattern ported from OpenClaw

**First Skill -- telegram-parser**:
- Trigger: forwarded messages or "organize", "parse"
- Extraction fields: project name, type (airdrop|testnet|ama|mint|quest|snapshot|tge), deadline, participation requirements, expected reward, difficulty (easy|medium|hard), links
- Output format: 2-3 line compressed summary
- Auto-exclude: paid mint > $50, scam keywords ("send ETH to", "guaranteed profit", "100x"), duplicate projects

#### E. Cron System + Group Support
- cron.py: HH:MM based scheduler (08:00 crypto digest, 21:00 project status)
- Group @mention response (group_mode: 3 sentences max, EXECUTE prohibited)
- Heartbeat 30min (existence check only, work content private)

#### F. Module Separation (Codex Prompt 01 -- CCB-019 done)
- bot.py 1900 lines -> orchestration-focused cleanup
- handlers/commands.py: command handler separation
- handlers/scheduler.py: cron/scheduling
- handlers/messaging.py: message processing
- handlers/__init__.py: package initialization

#### G. Runner Safety (Codex Prompt 02)
- runner.py: ErrorCategory 7-type classification
- progress_cb protection, stderr tail
- Committed

#### H. Brain Routing Enhancement (Codex Prompt 03 -- CCB-018 done)
- EXECUTE parser enhancement
- Fallback UX + backoff
- intent.py tone simplification

#### I. ROADMAP (2026-02-20 new)
- Phase 1: Perceived features (dashboard, error interpretation, cost tracking)
- Phase 2: Natural language execution stabilization
- Phase 3: Skill/automation expansion
- Phase 4: Group/multi-chat
- Phase 5: Autonomous operations

**Completion Status:**

| Feature | Status |
|---------|--------|
| Workspace file loading (SOUL/USER/AGENTS/TOOLS.md) | committed |
| Skill system (manifest + telegram-parser) | committed |
| Forwarding message parser (telegram_parser.py) | committed |
| Cron system (cron.py) | committed |
| Group @mention + heartbeat | committed |
| Multi-agent routing (/code, /codex, /triangle, /duet, /auto) | committed |
| Brain retry + typing indicator | committed |
| Runner ErrorCategory 7-type + progress_cb protection | committed |
| health_api enhancement (success_rate_24h, process_alive) | committed |
| bot.py module separation -> handlers/ | done (CCB-019) |
| Brain EXECUTE parser enhancement + fallback UX | done (CCB-018) |
| SOUL-codex.md (Codex-specific persona) | done (CCB-017) |
| ROADMAP.md Phase 1-5 | committed |

**Current Issue -- Brain Response Speed/Stability:**
- Brain initialization: success (Claude Agent SDK v0.1.38)
- Natural language conversation: confirmed working (12.4s response, UX mitigated with typing indicator)
- Failure patterns: rate_limit_event (SDK unsupported), timeout, CLI exit code 1
- Mitigation: retry logic (max 2 retries, 5/10s backoff), timeout 90s

**Core Challenge:** Brain must operate stably for natural language->EXECUTE coding dispatch to work. Currently, when Brain fails, it falls back to regex (only 5 patterns recognized), making natural language processing impossible.

### 6-2. Make Money Engine Improvements (Active)

- Session 3 (2026-02-23): Fixed dashboard on-chain position not displaying, fixed strategy selection turbo lock bug
- Session 5 (2026-02-23): Separated closed on-chain positions from OPEN->claim, supplemented trades PnL NULL, on-chain date display
- CX tuning applied: qualityFloor + smart money regime + tuning_pack_id tracking + A/B report API
- Codex MM-SYNC-RECON-03: Removed SYNC_PHANTOM immediate 0-close -> grace period/re-verification structure + on-chain comparison audit API
- Codex MM-PHANTOM-BACKFILL-04: Full backfill comparison of existing 20 SYNC_PHANTOM entries complete
- Bot current status: LIVE ($26.08 balance, 18847 cycles), Codex changes reflected after server restart

### 6-3. Key Architecture Decision Records (ADR)

| Decision | Choice | Rejected Alternative | Reason |
|----------|--------|---------------------|--------|
| OpenClaw adoption method | Port patterns only | Install official framework | Security risk: CVE-2026-25253 RCE, plaintext credentials, ClubHub 12% malicious skills, 40K+ exposed instances |
| Multi-agent branching | Prefix routing (/code, /codex, etc.) | Separate into 2 Telegram bots | Single channel operational simplicity, easy context sharing |
| System prompt management | Workspace .md files | personas.py hardcoding | Real-time editable, easy per-agent separation. Hardcoding preserved as fallback |
| Skill system | Manifest-only injection + on-demand Read | Full content in system prompt | Token savings, context window efficiency |
| Bot execution environment | Main PC WSL (PM2) | Mac Mini isolation / Cloud VM | Zero additional cost, reuse existing infrastructure. Pattern porting reduces attack surface, lowering isolation urgency |
| Codex invocation method | `codex exec` CLI direct call | SDK integration | OpenAI Codex CLI is the only official interface |

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

---

---

## S7 DB Schema Status

| Project | DB | Tables/Collections | Source File |
|---------|-----|-------------------|------------|
| Asset Manager (Web3 Ledger) | Supabase | accounts, transactions, recurring_items, rpg_data | `supabase/schema.sql` |
| Navigator (todolist) | Firebase + localStorage | (no config file) | `(none)` |
| Baby Care | Firebase | (no match) | `lib/firebase/firestore.ts` |
| Kimchi Premium | Supabase | (no match) | `react-app/src/hooks/usePaperTrades.js` |
| Telegram Event Bot | Supabase | (no match) | `database.py` |
| Saitama Training | Firebase | (no match) | `src/hooks/use-firebase-sync.ts` |
| Make Money | SQLite | trades, orders, portfolio_snapshots, agent_logs, agent_state, ai_analysis_logs, signal_learning, team_decisions, orphaned_orders | `server/db.js` |
| OpenClaw (Coding Bot) | SQLite | history, scheduled_tasks, context_memory, bot_meta, conversation_messages, github_events, forwarded_events, approval_requests, makemoney_health_events | `db.py` |
| Mission Control | Supabase | (no config file) | `(none)` |

---

## S8 Recent Diary

### 2026-02-24 (1 session)

1. Added Quick Launch panel to Mission Control

### 2026-02-23 (5 sessions)

1. Diagnosed claude-mem MCP connection error + installed Python 3.13 + full work environment check
2. Diagnosed and resolved mobile SSH connection issue
3. Fixed Make Money dashboard position not displaying + strategy selection lock bug
4. awesome-claude-code research + permissions cleanup + session-end skill improvement
5. Fixed 3 Make Money dashboard bugs

### 2026-02-22 (6 sessions)

1. Terminal session cleanup guide + text-rpg Codex deliverable review + commit + push
2. OpenClaw zombie VM diagnosis + data backup + cleanup attempt
3. System inspection + environment cleanup + Make Money bot status check
4. Make Money dashboard "alive feel" improvement + pm2 operations environment setup
5. Make Money dashboard strategy change bug fix + position entry failure cause analysis/resolution
6. Follow-up verification and fixes for previous session "full development process overhaul"



---

## S9 Tech Stack

| Project | Key Dependencies |
|---------|-----------------|
| X Article Editor | @google/generative-ai, @supabase/ssr, @supabase/supabase-js, @tiptap/extension-image, @tiptap/extension-placeholder, @tiptap/extension-strike, @tiptap/extension-underline, @tiptap/pm, @tiptap/react, @tiptap/starter-kit |
| Asset Manager (Web3 Ledger) | @supabase/supabase-js, chart.js |
| Navigator (todolist) | firebase, playwright, serve |
| Baby Care | date-fns, firebase, framer-motion, nanoid, next, react, react-dom, recharts |
| Kimchi Premium | python-telegram-bot, aiohttp, PyJWT, python-dotenv, supabase |
| Telegram Event Bot | python-telegram-bot, flask, python-dotenv, flask-limiter, supabase, pytest |
| Portfolio | framer-motion, react, react-dom |
| Text RPG (Abyss) | (none) |
| Saitama Training | @tailwindcss/vite, firebase, react, react-dom, react-router-dom, tailwindcss, zustand |
| Make Money | (none) |
| OpenClaw (Coding Bot) | python-telegram-bot, python-dotenv, aiohttp |
| Mission Control | @supabase/ssr, @supabase/supabase-js, clsx, date-fns, lucide-react, next, react, react-dom, recharts, tailwind-merge |

---

## S10 Known Errors

**All resolved** -- 0 unresolved items.

| ID | Error | Resolution |
|----|-------|-----------|
| ERR-001 | better-sqlite3 platform binding crash | Make Money server runs on Windows only |
| ERR-002 | Korean path encoding corruption | Created NTFS junction `C:\vibe` + full migration (30+ files) |
| ERR-003 | PowerShell v5 vs v7 compatibility | Added `$env:OS -eq "Windows_NT"` fallback |
| ERR-004 | WSL symlink divergence | Set up symlinks with wsl-symlink-setup.sh |
| ERR-005 | Polymarket cancelOrder payload format | Fixed polymarket.js payload format |
| ERR-006 | Native module cross-platform mismatch | Separate npm install in each execution environment |
| ERR-007 | sync-recovery infinite import loop | Load EXPIRED_WORTHLESS/REDEEMABLE token_id into `_syncBlacklist` Set + check OPEN/CLOSED same token_id within 24h |
| ERR-008 | EXPIRED_WORTHLESS PnL hardcoded 0 | Calculate `pnl = exitValue - entryCost` then pass + retroactively fix existing data with fix-expired-pnl.js |
| ERR-009 | better-sqlite3 FK constraint DELETE failure | `PRAGMA foreign_keys = OFF` + execute DELETE FROM orders WHERE trade_id = ? first |
| ERR-011 | Vite JSX transform not working (NTFS junction + fs.strict conflict) | Add `resolve: { preserveSymlinks: true }` + `server: { fs: { strict: false } }` to vite.config.js |


---

## S11 Core Rules (Required reading for Claude web)

### Absolute Prohibitions
- Modifying/reading/outputting `.env` files
- Hardcoding Korean paths (`C:\Users\.박준희\...` etc.)
- Reporting "complete" without verification
- Running OpenClaw on Windows / Running Make Money on WSL
- Fabricating nonexistent APIs/functions, speculative assertions

### Git Rules
- Codex: commit/push absolutely prohibited (Claude Code handles integrated processing)
- Commit format: `feat:`, `fix:`, `refactor:` (Korean)
- repo-sweep required before push

### Review Protocol
- Create O/X/triangle table for each original requirement number
- Results must always be organized in tables
- No "complete" unless Critical items are 0

### Honesty Principle
- Verify API/library existence before presenting code
- Tag with `[uncertain]` if unsure
- No speculative assertions like "it will probably work"

### Handoff 6-Line (Required)
```
TASK-ID:
Current status:
Modified files:
Remaining work:
Risks/precautions:
Next execution location: (Windows / WSL / Both)
```

---

## S12 Reference When Requesting from Claude Web

### Context Transfer Method
1. Attach this file (`HANDOFF-WEB.md`) (required)
2. One specific request line
3. Attach 2-3 changed files if needed

### What Claude Web Does Well
- Full codebase structure audit (batch analysis of tens of thousands of lines)
- Diff review (attach only changed files)
- New engine/feature/architecture design consultation
- Data-based profitability/performance analysis

### Claude Web Limitations
- Cannot directly access files (attachment only)
- Context lost on session reset
- Cannot execute code/verify builds

---

*Generated by handoff-generate.py on 2026-02-24 11:57 KST*
