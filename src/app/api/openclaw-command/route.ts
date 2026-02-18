import { NextRequest, NextResponse } from 'next/server';
import { createProxyResponse } from '@/types/status';

export const revalidate = 60;

const BASE_URL =
  process.env.OPENCLAW_API_URL || 'http://localhost:7100';
const COMMAND_TOKEN = process.env.OPENCLAW_COMMAND_TOKEN || '';

const VALID_GET_PATHS = ['status', 'history', 'projects', 'queue'] as const;
type ValidGetPath = (typeof VALID_GET_PATHS)[number];

const VALID_POST_ACTIONS = ['command', 'cancel'] as const;
type ValidPostAction = (typeof VALID_POST_ACTIONS)[number];

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') as ValidGetPath | null;

  if (!path || !VALID_GET_PATHS.includes(path)) {
    return NextResponse.json(
      { error: `Invalid path. Use: ${VALID_GET_PATHS.join(', ')}` },
      { status: 400 }
    );
  }

  const limit = request.nextUrl.searchParams.get('limit');
  const apiPath =
    path === 'history' && limit
      ? `/${path}?limit=${encodeURIComponent(limit)}`
      : `/${path}`;

  const result = await createProxyResponse(
    () => fetch(`${BASE_URL}${apiPath}`),
    5000
  );

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get(
    'action'
  ) as ValidPostAction | null;

  if (!action || !VALID_POST_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: `Invalid action. Use: ${VALID_POST_ACTIONS.join(', ')}` },
      { status: 400 }
    );
  }

  const body =
    action === 'command' ? await request.json().catch(() => ({})) : {};

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (COMMAND_TOKEN) {
    headers.Authorization = `Bearer ${COMMAND_TOKEN}`;
  }

  const result = await createProxyResponse(
    () =>
      fetch(`${BASE_URL}/${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }),
    10000
  );

  return NextResponse.json(result);
}
