'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Pm2ServiceInfo, ServiceAction } from '@/types';
import { getControlToken } from '@/lib/auth';

// ─── Status Polling ───

export function usePm2Status(intervalMs = 15000) {
  const [services, setServices] = useState<Pm2ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/pm2', { cache: 'no-store' });
      const json = await res.json();
      if (json.data) {
        setServices(json.data);
        setError(null);
      } else {
        setError(json.error || 'No data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, intervalMs);
    return () => clearInterval(id);
  }, [fetch_, intervalMs]);

  return { services, loading, error, refresh: fetch_ };
}

// ─── Service Actions ───

interface ActionResult {
  success: boolean;
  error?: string;
}

export function useServiceAction() {
  const [pendingSet, setPendingSet] = useState<Set<string>>(new Set());

  const execute = useCallback(
    async (name: string, action: ServiceAction, confirm = false): Promise<ActionResult> => {
      const token = getControlToken();
      if (!token) return { success: false, error: 'No auth token' };

      const key = `${name}:${action}`;
      setPendingSet((prev) => new Set(prev).add(key));
      try {
        const res = await fetch('/api/pm2/control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, name, confirm }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { success: false, error: json.error || `HTTP ${res.status}` };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Request failed' };
      } finally {
        setPendingSet((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    []
  );

  const isPending = useCallback(
    (name: string) => {
      for (const key of pendingSet) {
        if (key.startsWith(`${name}:`)) return true;
      }
      return false;
    },
    [pendingSet]
  );

  return { execute, isPending };
}

// ─── Log Viewer ───

export function useServiceLogs(name: string, enabled: boolean, intervalMs = 10000) {
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_ = useCallback(async () => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pm2/logs?name=${name}&lines=100`);
      const json = await res.json();
      if (json.data) {
        setStdout(json.data.stdout || '');
        setStderr(json.data.stderr || '');
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    if (!enabled) return;
    fetch_();
    intervalRef.current = setInterval(fetch_, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, fetch_, intervalMs]);

  return { stdout, stderr, loading, refresh: fetch_ };
}
