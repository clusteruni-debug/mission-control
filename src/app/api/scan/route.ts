import { NextResponse } from 'next/server';
import { scanAllProjects } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshots = await scanAllProjects();
    return NextResponse.json({ snapshots, scannedAt: new Date().toISOString() });
  } catch (error) {
    console.error('스캔 실패:', error);
    return NextResponse.json(
      { error: '프로젝트 스캔 중 오류 발생' },
      { status: 500 }
    );
  }
}
