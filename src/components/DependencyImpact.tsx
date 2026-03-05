'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertOctagon, ArrowRight, Loader2 } from 'lucide-react';
import { PROJECTS, SERVICE_REGISTRY, INFRA_INSTANCES } from '@/lib/constants';
import type { Pm2ServiceInfo } from '@/types';

interface ImpactEntry {
  service: string;
  status: string;
  directProject: string | null;
  affectedProjects: string[];
  infraImpact: string[];
}

function computeImpacts(services: Pm2ServiceInfo[]): ImpactEntry[] {
  const down = services.filter(
    (s) => s.status === 'errored' || s.status === 'failed'
  );
  if (down.length === 0) return [];

  return down.map((svc) => {
    const reg = SERVICE_REGISTRY.find((r) => r.name === svc.name);
    const ownerFolder = reg?.projectFolder ?? null;
    const affected = new Set<string>();

    if (ownerFolder) {
      affected.add(ownerFolder);
      for (const proj of PROJECTS) {
        if (proj.connections?.some((c) => c.target === ownerFolder)) {
          affected.add(proj.folder);
        }
      }
    }

    const infra = INFRA_INSTANCES
      .filter((i) => ownerFolder && i.projects.includes(ownerFolder))
      .map((i) => i.name);

    return {
      service: svc.name,
      status: svc.status,
      directProject: ownerFolder,
      affectedProjects: [...affected],
      infraImpact: infra,
    };
  });
}

export function DependencyImpact() {
  const [services, setServices] = useState<Pm2ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/pm2', { cache: 'no-store' });
        const json = await res.json();
        if (json.data) setServices(json.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 30000);
    return () => clearInterval(id);
  }, []);

  const impacts = useMemo(() => computeImpacts(services), [services]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        영향 분석 중...
      </div>
    );
  }

  if (impacts.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
      <div className="mb-3 flex items-center gap-2">
        <AlertOctagon className="h-4 w-4 text-red-500" />
        <span className="text-sm font-semibold text-red-700 dark:text-red-300">
          의존성 영향 분석
        </span>
        <span className="text-xs text-red-500">
          {impacts.length}개 서비스 오류
        </span>
      </div>

      <div className="space-y-2">
        {impacts.map((impact) => (
          <div
            key={impact.service}
            className="rounded-md border border-red-200 bg-white p-3 dark:border-red-900 dark:bg-gray-900"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono font-medium text-red-600 dark:text-red-400">
                {impact.service}
              </span>
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600 dark:bg-red-900 dark:text-red-300">
                {impact.status}
              </span>
            </div>

            {impact.affectedProjects.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
                <span className="text-gray-500">영향 범위:</span>
                {impact.affectedProjects.map((folder, idx) => {
                  const proj = PROJECTS.find((p) => p.folder === folder);
                  const isDirect = folder === impact.directProject;
                  return (
                    <span key={folder} className="flex items-center gap-1">
                      {idx > 0 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                      <span
                        className={
                          isDirect
                            ? 'rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        }
                      >
                        {proj?.name || folder}
                        {isDirect ? ' (직접)' : ' (간접)'}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}

            {impact.infraImpact.length > 0 && (
              <div className="mt-1 text-[10px] text-gray-400">
                인프라: {impact.infraImpact.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
