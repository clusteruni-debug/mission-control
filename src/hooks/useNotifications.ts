'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export const DEFAULT_MAKE_MONEY_LOSS_THRESHOLD = -10;
const SNOOZE_MS = 5 * 60 * 1000;

export interface NotificationConfig {
  makeMoneyLossThreshold?: number;
  serviceDownAlert: boolean;
  enabled: boolean;
}

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  dismissed: boolean;
  fingerprint?: string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useNotifications(config: NotificationConfig): {
  notifications: Notification[];
  dismiss: (id: string) => void;
  dismissAll: () => void;
  hasUnread: boolean;
  notify: (item: Omit<Notification, 'id' | 'timestamp' | 'dismissed'>) => void;
  checkServiceTransition: (service: string, status: string) => void;
  checkPnl: (value: number) => void;
} {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastServiceState = useRef<Record<string, string>>({});
  const offlineSince = useRef<Record<string, number>>({});
  const snoozedUntil = useRef<Record<string, number>>({});

  const threshold =
    config.makeMoneyLossThreshold ?? DEFAULT_MAKE_MONEY_LOSS_THRESHOLD;

  const pushNotification = useCallback(
    (
      item: Omit<Notification, 'id' | 'timestamp' | 'dismissed'> & {
        fingerprint?: string;
      }
    ) => {
      if (!config.enabled) return;
      const fingerprint = item.fingerprint || `${item.type}:${item.title}:${item.message}`;
      const snoozeUntil = snoozedUntil.current[fingerprint] || 0;
      if (Date.now() < snoozeUntil) return;

      const next: Notification = {
        id: makeId(),
        type: item.type,
        title: item.title,
        message: item.message,
        timestamp: new Date().toISOString(),
        dismissed: false,
        fingerprint,
      };

      setNotifications((prev) => [next, ...prev].slice(0, 10));

      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (window.Notification.permission === 'granted') {
          new window.Notification(item.title, { body: item.message });
        } else if (window.Notification.permission === 'default') {
          window.Notification.requestPermission().catch(() => null);
        }
      }
    },
    [config.enabled]
  );

  const checkServiceTransition = useCallback(
    (service: string, status: string) => {
      if (!config.enabled || !config.serviceDownAlert) return;
      const prev = lastServiceState.current[service];
      lastServiceState.current[service] = status;

      if (status === 'offline') {
        if (!offlineSince.current[service]) {
          offlineSince.current[service] = Date.now();
        }
        const elapsedMin = Math.max(
          1,
          Math.floor((Date.now() - offlineSince.current[service]) / 60000)
        );
        pushNotification({
          type: 'error',
          title: `${service} 오프라인`,
          message: `${service} ${elapsedMin}분째 오프라인`,
          fingerprint: `service-offline:${service}`,
        });
      } else {
        delete offlineSince.current[service];
      }

      if (prev && prev !== status && status !== 'offline') {
        pushNotification({
          type: 'info',
          title: `${service} 복구`,
          message: `${service} 상태가 ${status}로 변경되었습니다.`,
          fingerprint: `service-recovered:${service}`,
        });
      }
    },
    [config.enabled, config.serviceDownAlert, pushNotification]
  );

  const checkPnl = useCallback(
    (value: number) => {
      if (!config.enabled) return;
      if (value <= threshold) {
        pushNotification({
          type: 'warning',
          title: 'Make Money 손실 경고',
          message: `P&L ${value.toFixed(2)}$ (임계값 ${threshold}$)`,
          fingerprint: 'pnl-threshold',
        });
      }
    },
    [config.enabled, pushNotification, threshold]
  );

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        if (n.fingerprint) {
          snoozedUntil.current[n.fingerprint] = Date.now() + SNOOZE_MS;
        }
        return { ...n, dismissed: true };
      })
    );
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.fingerprint) {
          snoozedUntil.current[n.fingerprint] = Date.now() + SNOOZE_MS;
        }
        return { ...n, dismissed: true };
      })
    );
  }, []);

  const hasUnread = useMemo(
    () => notifications.some((n) => !n.dismissed),
    [notifications]
  );

  return {
    notifications,
    dismiss,
    dismissAll,
    hasUnread,
    notify: pushNotification,
    checkServiceTransition,
    checkPnl,
  };
}
