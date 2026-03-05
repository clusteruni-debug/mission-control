/**
 * One-time seed script: insert integration-idea tasks into mc_tasks.
 *
 * Usage:
 *   npx tsx scripts/seed-integration-tasks.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local without dotenv dependency
const envContent = readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const clean = line.replace(/\r$/, '');
  const match = clean.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const seeds = [
  { title: 'Make Money -> Asset Manager: 수익 데이터 자동 반영', project: 'make-money-project', priority: 'medium' },
  { title: 'Telegram Bot -> AI Hub: 대화 분석 파이프라인', project: 'telegram-event-bot', priority: 'low' },
  { title: 'Kimchi Premium -> Navigator: 김프 알림 연동', project: 'kimchi-premium', priority: 'medium' },
  { title: 'Baby Care -> Saitama Training: 루틴 연동', project: 'baby-care', priority: 'low' },
  { title: 'TRADINGLAB -> Make Money: 전략 자동 배포', project: 'coin-test-project', priority: 'medium' },
  { title: 'Cross-instance dashboard: Supabase #1 + #2 통합 메트릭', project: 'mission-control', priority: 'low' },
  { title: 'AI Hub Extension -> Telegram Bot: AI 요약 자동 전송', project: 'ai-hub-extension', priority: 'low' },
  { title: 'Portfolio -> Mission Control: 프로젝트 목록 자동 갱신', project: 'portfolio', priority: 'low' },
];

async function main() {
  const rows = seeds.map((s) => ({
    title: s.title,
    description: '',
    status: 'todo',
    priority: s.priority,
    type: 'integration-idea',
    project: s.project,
  }));

  const { data, error } = await supabase.from('mc_tasks').insert(rows).select();

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} integration-idea tasks.`);
}

main();
