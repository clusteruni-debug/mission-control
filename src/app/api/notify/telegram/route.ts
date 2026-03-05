import { NextResponse } from 'next/server';
import { isControlAuthorized } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// POST — Telegram으로 알림 메시지 전송
export async function POST(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, chatId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    const targetChat = chatId || process.env.TELEGRAM_ALERT_CHAT_ID;
    if (!targetChat) {
      return NextResponse.json({ error: 'No chat ID provided or TELEGRAM_ALERT_CHAT_ID not set' }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChat,
        text: message.trim(),
        parse_mode: 'Markdown',
      }),
    });

    const json = await res.json();

    if (!json.ok) {
      return NextResponse.json({ error: json.description || 'Telegram API error' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, messageId: json.result?.message_id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  }
}
