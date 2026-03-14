#!/usr/bin/env bash
set -euo pipefail
# push-snapshot.sh — Push monitoring snapshot from localhost to Supabase
# Run locally where services (Make Money, WatchBot, Telegram) are accessible.
# Schedule via pm2 cron or Windows Task Scheduler every 5 minutes.
#
# Requires: COLLECTOR_SECRET env var (set via pm2 ecosystem or .env)

MC_URL="${MC_URL:-http://localhost:3000}"

if [ -z "${COLLECTOR_SECRET:-}" ]; then
  echo "[$(date -Iseconds)] ERROR: COLLECTOR_SECRET not set" >&2
  exit 1
fi

response=$(curl -s -w "\n%{http_code}" -X POST "${MC_URL}/api/snapshot" \
  -H "Authorization: Bearer ${COLLECTOR_SECRET}" \
  --connect-timeout 10 --max-time 30 2>/dev/null)

http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
  echo "[$(date -Iseconds)] Snapshot pushed (HTTP ${http_code})"
else
  echo "[$(date -Iseconds)] ERROR: Snapshot push failed (HTTP ${http_code})" >&2
  exit 1
fi
