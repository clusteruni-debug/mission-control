import { NextRequest, NextResponse } from 'next/server';
import { createProxyResponse } from '@/types/status';

export const revalidate = 300;

const BASE_URL =
  process.env.TELEGRAM_BOT_API_URL || 'http://localhost:5001';

const VALID_PATHS = ['stats', 'health', 'analyzed'] as const;
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

  const result = await createProxyResponse(
    () => fetch(`${BASE_URL}${toApiPath(path)}`),
    5000
  );

  return NextResponse.json(result);
}
