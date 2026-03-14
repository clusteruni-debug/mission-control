import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isControlAuthorized } from '@/lib/auth';
import { SERVICE_REGISTRY } from '@/lib/constants';
import type { NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

// POST — 자동 인시던트 감지: errored 서비스 발견 시 인시던트 생성
export async function POST(request: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'localhost-only' }, { status: 400 });
  }
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. pm2 상태 가져오기
    const { stdout } = await execAsync('pm2 jlist');
    const pm2List = JSON.parse(stdout) as Array<{
      name: string;
      pm2_env?: { status?: string };
    }>;

    // errored 서비스 필터
    const erroredServices = pm2List
      .filter((p) => p.pm2_env?.status === 'errored')
      .map((p) => p.name)
      .filter((name) => SERVICE_REGISTRY.some((r) => r.name === name));

    if (erroredServices.length === 0) {
      return NextResponse.json({ detected: 0, created: 0 });
    }

    // 2. 이미 열린 인시던트가 있는지 확인
    const supabase = getSupabaseAdmin();
    const { data: openIncidents } = await supabase
      .from('mc_incidents')
      .select('services_affected')
      .in('status', ['open', 'investigating']);

    const alreadyCovered = new Set<string>();
    for (const inc of openIncidents ?? []) {
      for (const svc of inc.services_affected ?? []) {
        alreadyCovered.add(svc);
      }
    }

    const newErrored = erroredServices.filter((s) => !alreadyCovered.has(s));
    if (newErrored.length === 0) {
      return NextResponse.json({ detected: erroredServices.length, created: 0 });
    }

    // 3. 새 인시던트 자동 생성
    const severity = newErrored.some((s) =>
      SERVICE_REGISTRY.find((r) => r.name === s)?.protected
    )
      ? 'critical'
      : 'high';

    const { data, error } = await supabase
      .from('mc_incidents')
      .insert({
        title: `서비스 오류 감지: ${newErrored.join(', ')}`,
        description: `자동 감지됨. 오류 상태인 서비스: ${newErrored.join(', ')}`,
        severity,
        status: 'open',
        services_affected: newErrored,
        detected_at: new Date().toISOString(),
        source: 'health-check',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Telegram 알림 (선택적)
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ALERT_CHAT_ID;
    if (telegramToken && chatId) {
      const message = `🚨 *인시던트 자동 감지*\n\n서비스: ${newErrored.join(', ')}\n심각도: ${severity}\n\n[Mission Control에서 확인](http://localhost:3000)`;
      fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
      }).catch(() => {});
    }

    return NextResponse.json({ detected: erroredServices.length, created: 1, incident: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  }
}
