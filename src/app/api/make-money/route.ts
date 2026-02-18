import { NextRequest, NextResponse } from 'next/server';
import { createProxyResponse } from '@/types/status';

export const revalidate = 60; // trades 60초 기준 (portfolio/engines/health도 동일 적용)

const BASE_URL =
  process.env.MAKE_MONEY_API_URL || 'http://localhost:3001';

const VALID_PATHS = ['portfolio', 'health', 'engines', 'trades'] as const;
type ValidPath = (typeof VALID_PATHS)[number];

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') as ValidPath | null;

  if (!path || !VALID_PATHS.includes(path)) {
    return NextResponse.json(
      { error: `Invalid path. Use: ${VALID_PATHS.join(', ')}` },
      { status: 400 }
    );
  }

  const apiPath = path === 'trades' ? '/api/trades?limit=5' : `/api/${path}`;

  const result = await createProxyResponse(
    () => fetch(`${BASE_URL}${apiPath}`),
    5000
  );

  return NextResponse.json(result);
}
