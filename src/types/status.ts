// Mission Control — 공통 상태 타입 정의
// 모든 Phase의 프록시 API, 위젯, OpenClaw 백엔드에서 공유하는 "언어"

// --- Enums ---

/** 외부 서비스 연결 상태 */
export type ServiceStatus = 'online' | 'degraded' | 'offline' | 'unknown';

/** OpenClaw 작업 상태 (Python 백엔드 호환) */
export type TaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

// --- Color Mapping ---

const STATUS_COLORS: Record<ServiceStatus, string> = {
  online: 'emerald',
  degraded: 'amber',
  offline: 'red',
  unknown: 'gray',
};

/** ServiceStatus에 대응하는 Tailwind 색상 계열 반환 */
export function getStatusColor(status: ServiceStatus): string {
  return STATUS_COLORS[status];
}

// --- ProxyResponse ---

const DEGRADED_THRESHOLD_MS = 3000;

/** 모든 프록시 API의 표준 응답 포맷 */
export interface ProxyResponse<T> {
  data: T | null;
  status: ServiceStatus;
  fetchedAt: string; // ISO 8601
  error?: string; // offline/degraded일 때 이유
  responseTimeMs?: number; // 응답 시간 (degraded 판별용)
}

/**
 * fetch 결과와 응답시간을 받아 ProxyResponse를 자동 생성한다.
 *
 * - 200 + 응답시간 < 3초 → online
 * - 200 + 응답시간 >= 3초 → degraded
 * - non-200 → offline (에러 메시지 포함)
 * - fetch 실패 / timeout → offline (에러 메시지 포함)
 */
export async function createProxyResponse<T>(
  fetchFn: () => Promise<Response>,
  timeoutMs: number = 5000
): Promise<ProxyResponse<T>> {
  const fetchedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetchFn().then((r) => {
      clearTimeout(timeout);
      return r;
    });

    const responseTimeMs = Date.now() - start;

    if (!res.ok) {
      return {
        data: null,
        status: 'offline',
        fetchedAt,
        error: `HTTP ${res.status} ${res.statusText}`,
        responseTimeMs,
      };
    }

    const data: T = await res.json();
    const status: ServiceStatus =
      responseTimeMs >= DEGRADED_THRESHOLD_MS ? 'degraded' : 'online';

    return {
      data,
      status,
      fetchedAt,
      responseTimeMs,
      ...(status === 'degraded' && {
        error: `응답 시간 ${responseTimeMs}ms (임계값 ${DEGRADED_THRESHOLD_MS}ms 초과)`,
      }),
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    const message =
      err instanceof Error ? err.message : '알 수 없는 오류';
    const isTimeout =
      message.includes('abort') || message.includes('timeout');

    return {
      data: null,
      status: 'offline',
      fetchedAt,
      error: isTimeout
        ? `타임아웃 (${timeoutMs}ms 초과)`
        : message,
      responseTimeMs,
    };
  }
}
