'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Incident, IncidentSeverity, IncidentStatus } from '@/types';
import { getControlToken } from '@/lib/auth';

export function useIncidents(pollMs = 30000) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableReady, setTableReady] = useState(true);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents', { cache: 'no-store' });
      const json = await res.json();
      if (json.items) {
        setIncidents(json.items);
        setTableReady(json.tableReady !== false);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const id = setInterval(fetchIncidents, pollMs);
    return () => clearInterval(id);
  }, [fetchIncidents, pollMs]);

  const createIncident = useCallback(
    async (data: {
      title: string;
      description?: string;
      severity: IncidentSeverity;
      services_affected?: string[];
    }) => {
      const token = getControlToken();
      if (!token) return { success: false, error: 'No auth token' };

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.item) {
        setIncidents((prev) => [json.item, ...prev]);
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed' };
    },
    []
  );

  const updateIncident = useCallback(
    async (id: number, updates: { status?: IncidentStatus; severity?: IncidentSeverity }) => {
      const token = getControlToken();
      if (!token) return { success: false, error: 'No auth token' };

      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...updates }),
      });
      const json = await res.json();
      if (res.ok && json.item) {
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? json.item : inc))
        );
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed' };
    },
    []
  );

  const deleteIncident = useCallback(
    async (id: number) => {
      const token = getControlToken();
      if (!token) return { success: false, error: 'No auth token' };

      const res = await fetch(`/api/incidents?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIncidents((prev) => prev.filter((inc) => inc.id !== id));
        return { success: true };
      }
      const json = await res.json();
      return { success: false, error: json.error || 'Failed' };
    },
    []
  );

  const openCount = incidents.filter((i) => i.status !== 'resolved').length;

  return {
    incidents,
    loading,
    tableReady,
    openCount,
    refresh: fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
  };
}
