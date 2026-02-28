import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
  // AI Hub는 Electron 앱 — HTTP 포트 없음
  // pm2 프로세스 존재 여부로 상태 판단
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const { stdout } = await execAsync('pm2 jlist', { timeout: 5000 });
    const processes = JSON.parse(stdout);
    const aiHub = processes.find(
      (p: { name: string }) => p.name === 'ai-hub'
    );

    if (!aiHub) {
      return NextResponse.json({
        status: 'offline',
        fetchedAt: new Date().toISOString(),
        error: 'pm2에 ai-hub 프로세스 없음',
      });
    }

    const status = aiHub.pm2_env?.status === 'online' ? 'online' : 'offline';

    return NextResponse.json({
      status,
      fetchedAt: new Date().toISOString(),
      pm2Status: aiHub.pm2_env?.status,
      uptime: aiHub.pm2_env?.pm_uptime,
      memory: aiHub.monit?.memory,
      cpu: aiHub.monit?.cpu,
    });
  } catch {
    return NextResponse.json({
      status: 'offline',
      fetchedAt: new Date().toISOString(),
      error: 'pm2 명령 실행 실패 (로컬 전용)',
    });
  }
}
