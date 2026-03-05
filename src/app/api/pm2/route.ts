import { NextResponse } from 'next/server';
import type { Pm2ServiceInfo, Pm2Status } from '@/types';
import { SERVICE_REGISTRY } from '@/lib/constants';

export const revalidate = 0;

interface Pm2Process {
  name: string;
  pm_id: number;
  pm2_env?: {
    status?: string;
    pm_uptime?: number;
    restart_time?: number;
    autorestart?: boolean;
  };
  monit?: {
    memory?: number;
    cpu?: number;
  };
}

async function getPm2Processes(): Promise<Pm2Process[]> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { stdout } = await execAsync('pm2 jlist', { timeout: 5000 });
    return JSON.parse(stdout);
  } catch {
    return [];
  }
}

async function getWslServiceStatus(unit: string): Promise<'active' | 'inactive' | 'failed' | 'unknown'> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { stdout } = await execAsync(
      `wsl bash -c "systemctl --user is-active ${unit}"`,
      { timeout: 5000 }
    );
    const status = stdout.trim();
    if (status === 'active') return 'active';
    if (status === 'inactive') return 'inactive';
    if (status === 'failed') return 'failed';
    return 'unknown';
  } catch (err) {
    // systemctl is-active exits non-zero for inactive/failed — stdout still has status text
    const execErr = err as { stdout?: string };
    const status = (execErr.stdout || '').trim();
    if (status === 'inactive') return 'inactive';
    if (status === 'failed') return 'failed';
    return 'unknown';
  }
}

export async function GET() {
  if (process.env.VERCEL) {
    return NextResponse.json({
      data: null,
      status: 'unknown',
      fetchedAt: new Date().toISOString(),
      error: 'localhost-only',
    });
  }

  try {
    const pm2Processes = await getPm2Processes();
    const pm2Map = new Map(pm2Processes.map((p) => [p.name, p]));

    const services: Pm2ServiceInfo[] = [];

    for (const entry of SERVICE_REGISTRY) {
      if (entry.runtime === 'wsl-systemd') {
        const wslStatus = await getWslServiceStatus(entry.name);
        services.push({
          name: entry.name,
          pm_id: null,
          status: wslStatus,
          cpu: null,
          memory: null,
          uptime: null,
          restarts: 0,
          runtime: entry.runtime,
          autorestart: entry.autorestart,
          port: entry.port ?? null,
          category: entry.category,
          protected: entry.protected,
        });
      } else {
        const proc = pm2Map.get(entry.name);
        if (proc) {
          services.push({
            name: entry.name,
            pm_id: proc.pm_id,
            status: (proc.pm2_env?.status as Pm2Status) || 'stopped',
            cpu: proc.monit?.cpu ?? null,
            memory: proc.monit?.memory ?? null,
            uptime: proc.pm2_env?.pm_uptime ?? null,
            restarts: proc.pm2_env?.restart_time ?? 0,
            runtime: entry.runtime,
            autorestart: entry.autorestart,
            port: entry.port ?? null,
            category: entry.category,
            protected: entry.protected,
          });
        } else {
          services.push({
            name: entry.name,
            pm_id: null,
            status: 'not_registered',
            cpu: null,
            memory: null,
            uptime: null,
            restarts: 0,
            runtime: entry.runtime,
            autorestart: entry.autorestart,
            port: entry.port ?? null,
            category: entry.category,
            protected: entry.protected,
          });
        }
      }
    }

    return NextResponse.json({
      data: services,
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
