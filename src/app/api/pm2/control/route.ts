import { NextRequest, NextResponse } from 'next/server';
import { isControlAuthorized } from '@/lib/auth';
import { SERVICE_REGISTRY, SERVICE_NAME_REGEX } from '@/lib/constants';
import type { ServiceAction } from '@/types';

export async function POST(request: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'localhost-only' }, { status: 403 });
  }

  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { action?: string; name?: string; confirm?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, name, confirm } = body;

  if (!action || !name) {
    return NextResponse.json({ error: 'action and name required' }, { status: 400 });
  }

  if (!['start', 'stop', 'restart'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!SERVICE_NAME_REGEX.test(name)) {
    return NextResponse.json({ error: 'Invalid service name' }, { status: 400 });
  }

  const entry = SERVICE_REGISTRY.find((s) => s.name === name);
  if (!entry) {
    return NextResponse.json({ error: 'Service not in registry' }, { status: 404 });
  }

  if (entry.protected && (action === 'stop' || action === 'restart') && !confirm) {
    return NextResponse.json({
      error: 'Protected service — confirm: true required',
      protected: true,
    }, { status: 403 });
  }

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    let cmd: string;
    const typedAction = action as ServiceAction;

    if (entry.runtime === 'wsl-systemd') {
      cmd = `wsl bash -c "systemctl --user ${typedAction} ${name}"`;
    } else if (typedAction === 'start') {
      // Use ecosystem config for start — handles not_registered services
      cmd = `pm2 start C:/vibe/ecosystem.config.cjs --only ${name}`;
    } else {
      cmd = `pm2 ${typedAction} ${name}`;
    }

    const { stdout, stderr } = await execAsync(cmd, { timeout: 15000 });

    return NextResponse.json({
      success: true,
      action: typedAction,
      name,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      executedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Command failed';
    return NextResponse.json({
      success: false,
      action,
      name,
      error: message,
    }, { status: 500 });
  }
}
