'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export interface NotificationConfig {
  makeMoneyLossThreshold: number;
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

  const pushNotification = useCallback(
    (item: Omit<Notification, 'id' | 'timestamp' | 'dismissed'>) => {
      if (!config.enabled) return;

      const next: Notification = {
        id: makeId(),
        type: item.type,
        title: item.title,
        message: item.message,
        timestamp: new Date().toISOString(),
        dismissed: false,
      };

      setNotifications((prev) => [next, ...prev].slice(0, 50));

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

      if (prev && prev !== 'offline' && status === 'offline') {
        pushNotification({
          type: 'error',
          title: `${service} 오프라인`,
          message: `${service}가 offline 상태로 전환되었습니다.`,
        });
      }
    },
    [config.enabled, config.serviceDownAlert, pushNotification]
  );

  const checkPnl = useCallback(
    (value: number) => {
      if (!config.enabled) return;
      if (value <= config.makeMoneyLossThreshold) {
        pushNotification({
          type: 'warning',
          title: 'Make Money 손실 경고',
          message: `P&L ${value.toFixed(2)}$ (임계값 ${config.makeMoneyLossThreshold}$)`,
        });
      }
    },
    [config.enabled, config.makeMoneyLossThreshold, pushNotification]
  );

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
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

