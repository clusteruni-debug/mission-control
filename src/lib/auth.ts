import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'mc_control_token';

/** Server-side: verify Bearer token against MC_CONTROL_SECRET */
export function isControlAuthorized(request: NextRequest): boolean {
  const expected = process.env.MC_CONTROL_SECRET;
  if (!expected) return false;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${expected}`;
}

/** Client-side: get stored control token */
export function getControlToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Client-side: save control token */
export function setControlToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/** Client-side: clear control token */
export function clearControlToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}
