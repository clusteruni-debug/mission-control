#!/usr/bin/env bash
# sync-gh-token.sh — Sync local gh CLI token to Vercel GITHUB_TOKEN
# The gh CLI auto-refreshes OAuth tokens, but Vercel has a static copy.
# Run daily via Task Scheduler or manually when diary stops loading.

TOKEN=$(gh auth token 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "[$(date -Iseconds)] ERROR: gh auth token returned empty" >&2
  exit 1
fi

# Remove old + add new for production
npx vercel env rm GITHUB_TOKEN production -y 2>/dev/null
echo "$TOKEN" | npx vercel env add GITHUB_TOKEN production --yes 2>&1

echo "[$(date -Iseconds)] Vercel GITHUB_TOKEN synced"
