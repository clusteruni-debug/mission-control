'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AgentTask, AgentTaskPhase, AgentTaskSource } from '@/types';
import { getControlToken } from '@/lib/auth';

export function useAgentQueue(pollMs = 30000) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableReady, setTableReady] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/agent-queue', { cache: 'no-store' });
      const json = await res.json();
      if (json.items) {
        setTasks(json.items);
        setTableReady(json.tableReady !== false);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const id = setInterval(fetchTasks, pollMs);
    return () => clearInterval(id);
  }, [fetchTasks, pollMs]);

  const createTask = useCallback(
    async (data: {
      title: string;
      project: string;
      description?: string;
      priority?: number;
      source?: AgentTaskSource;
    }) => {
      const token = getControlToken();
      if (!token) return { success: false, error: 'No auth token' };

      const res = await fetch('/api/agent-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.item) {
        setTasks((prev) => [json.item, ...prev]);
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed' };
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, updates: { phase?: AgentTaskPhase; priority?: number; agent?: string; result_summary?: string; error?: string }) => {
      const token = getControlToken();
      if (!token) return { success: false, error: 'No auth token' };

      const res = await fetch('/api/agent-queue', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...updates }),
      });
      const json = await res.json();
      if (res.ok && json.item) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? json.item : t))
        );
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed' };
    },
    []
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const token = getControlToken();
      if (!token) return { success: false, error: 'No auth token' };

      const res = await fetch(`/api/agent-queue?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        return { success: true };
      }
      const json = await res.json();
      return { success: false, error: json.error || 'Failed' };
    },
    []
  );

  const activeCount = tasks.filter(
    (t) => !['done', 'failed', 'escalated'].includes(t.phase)
  ).length;

  return {
    tasks,
    loading,
    tableReady,
    activeCount,
    refresh: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
