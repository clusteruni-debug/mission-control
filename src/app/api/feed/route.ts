import { NextResponse } from 'next/server';
import { fetchUnifiedFeed } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const feed = await fetchUnifiedFeed(30);
    return NextResponse.json({ feed, scannedAt: new Date().toISOString() });
  } catch (error) {
    console.error('피드 로딩 실패:', error);
    return NextResponse.json(
      { error: '활동 피드 로딩 중 오류 발생' },
      { status: 500 }
    );
  }
}
