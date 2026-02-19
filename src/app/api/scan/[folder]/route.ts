import { NextResponse } from 'next/server';
import { PROJECTS } from '@/lib/constants';
import { scanProjectDetail } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folder: string }> }
) {
  const { folder } = await params;
  const project = PROJECTS.find((p) => p.folder === folder);

  if (!project) {
    return NextResponse.json(
      { error: '프로젝트를 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  try {
    const detail = await scanProjectDetail(project);
    return NextResponse.json({ detail, scannedAt: new Date().toISOString() });
  } catch (error) {
    console.error(`프로젝트 스캔 실패 (${folder}):`, error);
    return NextResponse.json(
      { error: '프로젝트 스캔 중 오류 발생' },
      { status: 500 }
    );
  }
}
