'use client';

import { useEffect, useMemo } from 'react';
import { AlertTriangle, Info, XCircle, X } from 'lucide-react';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationBannerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

function typeClass(type: Notification['type']): string {
  if (type === 'error') return 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/70 dark:text-red-200';
  if (type === 'warning') return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-200';
  return 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-200';
}

function typeIcon(type: Notification['type']) {
  if (type === 'error') return XCircle;
  if (type === 'warning') return AlertTriangle;
  return Info;
}

export function NotificationBanner({
  notifications,
  onDismiss,
}: NotificationBannerProps) {
  const active = useMemo(
    () => notifications.filter((n) => !n.dismissed).slice(0, 3),
    [notifications]
  );

  useEffect(() => {
    if (!active.length) return;
    const timers = active.map((item) =>
      window.setTimeout(() => onDismiss(item.id), 10000)
    );
    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
  }, [active, onDismiss]);

  if (!active.length) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-3xl px-4">
      <div className="space-y-2">
        {active.map((item) => {
          const Icon = typeIcon(item.type);
          return (
            <div
              key={item.id}
              className={`animate-[slide-down_.2s_ease-out] rounded-lg border px-4 py-3 shadow-lg ${typeClass(item.type)}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-sm opacity-90">{item.message}</p>
                </div>
                <button
                  onClick={() => onDismiss(item.id)}
                  className="rounded p-1 opacity-70 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

