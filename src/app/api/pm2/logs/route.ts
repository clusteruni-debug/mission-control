import { NextRequest, NextResponse } from 'next/server';
import { SERVICE_REGISTRY, SERVICE_NAME_REGEX } from '@/lib/constants';

const MAX_LINES = 200;

export async function GET(request: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'localhost-only' }, { status: 403 });
  }

  const name = request.nextUrl.searchParams.get('name');
  const linesParam = request.nextUrl.searchParams.get('lines');
  const lines = Math.min(Math.max(parseInt(linesParam || '50', 10) || 50, 1), MAX_LINES);

  if (!name || !SERVICE_NAME_REGEX.test(name)) {
    return NextResponse.json({ error: 'Invalid service name' }, { status: 400 });
  }

  const entry = SERVICE_REGISTRY.find((s) => s.name === name);
  if (!entry) {
    return NextResponse.json({ error: 'Service not in registry' }, { status: 404 });
  }

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    let stdout = '';
    let stderr = '';

    if (entry.runtime === 'wsl-systemd') {
      try {
        const result = await execAsync(
          `wsl bash -c "journalctl --user -u ${name} --no-pager -n ${lines}"`,
          { timeout: 10000 }
        );
        stdout = result.stdout;
        stderr = result.stderr;
      } catch {
        stdout = '(no logs available)';
      }
    } else {
      try {
        const result = await execAsync(
          `pm2 logs ${name} --nostream --lines ${lines}`,
          { timeout: 10000 }
        );
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (err) {
        const execErr = err as { stdout?: string; stderr?: string };
        stdout = execErr.stdout || '';
        stderr = execErr.stderr || '';
      }
    }

    return NextResponse.json({
      data: { stdout, stderr },
      status: 'online',
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      data: null,
      status: 'offline',
      fetchedAt: new Date().toISOString(),
      error: message,
    });
  }
}
