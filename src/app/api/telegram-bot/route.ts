import { NextRequest, NextResponse } from 'next/server';
import { createProxyResponse } from '@/types/status';

export const revalidate = 300;

const BASE_URL =
  process.env.TELEGRAM_BOT_API_URL || 'https://telegram-event-bot-ashy.vercel.app';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const VALID_PATHS = ['stats', 'health', 'analyzed', 'bot-polling'] as const;
type ValidPath = (typeof VALID_PATHS)[number];

function toApiPath(path: ValidPath): string {
  if (path === 'stats') return '/api/stats';
  if (path === 'analyzed') return '/api/analyzed';
  return '/health';
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') as ValidPath | null;

  if (!path || !VALID_PATHS.includes(path)) {
    return NextResponse.json(
      { error: `Invalid path. Use: ${VALID_PATHS.join(', ')}` },
      { status: 400 }
    );
  }

  // bot-polling: Telegram API getMe로 봇 토큰/프로세스 상태 확인
  if (path === 'bot-polling') {
    if (!BOT_TOKEN) {
      return NextResponse.json({
        data: null,
        status: 'unknown',
        fetchedAt: new Date().toISOString(),
        error: 'TELEGRAM_BOT_TOKEN 미설정',
      });
    }

    const result = await createProxyResponse(
      () => fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`),
      5000
    );

    return NextResponse.json(result);
  }

  const result = await createProxyResponse(
    () => fetch(`${BASE_URL}${toApiPath(path)}`),
    5000
  );

  return NextResponse.json(result);
}
