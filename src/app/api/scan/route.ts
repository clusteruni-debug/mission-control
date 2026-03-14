import { NextResponse } from 'next/server';
import { scanAllProjects } from '@/lib/github';
import { SERVICE_REGISTRY } from '@/lib/constants';
import type { ProjectSnapshot } from '@/types';

export const dynamic = 'force-dynamic';

let execAsync: ((cmd: string, opts?: { timeout?: number; maxBuffer?: number }) => Promise<{ stdout: string }>) | null = null;

async function getPm2StatusMap(): Promise<Map<string, string>> {
  if (process.env.VERCEL) return new Map();
  try {
    if (!execAsync) {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      execAsync = promisify(exec);
    }
    const { stdout } = await execAsync('pm2 jlist', { timeout: 5000, maxBuffer: 2 * 1024 * 1024 });
    const processes: unknown = JSON.parse(stdout);
    if (!Array.isArray(processes)) return new Map();
    return new Map(
      processes.map((p: { name: string; pm2_env?: { status?: string } }) => [p.name, p.pm2_env?.status || 'stopped'])
    );
  } catch (err) {
    console.warn('pm2 status check failed:', err instanceof Error ? err.message : err);
    return new Map();
  }
}

function augmentWithRuntimeCategory(
  snapshots: ProjectSnapshot[],
  pm2Status: Map<string, string>,
): ProjectSnapshot[] {
  if (pm2Status.size === 0) return snapshots;

  return snapshots.map((s) => {
    const projectServices = SERVICE_REGISTRY.filter(
      (sr) => sr.projectFolder === s.project.folder
    );
    if (projectServices.length === 0) return s;

    let hasOnline = false;
    let hasOffline = false;
    for (const svc of projectServices) {
      if (svc.runtime === 'wsl-systemd') continue;
      const status = pm2Status.get(svc.name);
      if (status === 'online') hasOnline = true;
      else if (status) hasOffline = true;
    }

    if (hasOnline) return { ...s, runtimeCategory: 'running' as const };
    if (hasOffline) return { ...s, runtimeCategory: 'stopped' as const };
    return s;
  });
}

export async function GET() {
  try {
    const [snapshots, pm2Status] = await Promise.all([
      scanAllProjects(),
      getPm2StatusMap(),
    ]);
    const augmented = augmentWithRuntimeCategory(snapshots, pm2Status);
    return NextResponse.json({ snapshots: augmented, scannedAt: new Date().toISOString() });
  } catch (error) {
    console.error('스캔 실패:', error);
    return NextResponse.json(
      { error: '프로젝트 스캔 중 오류 발생' },
      { status: 500 }
    );
  }
}
