'use client';

import { useEffect } from 'react';

interface ShortcutConfig {
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  onCommandPalette: () => void;
}

const TAB_BY_KEY: Record<string, string> = {
  '1': 'overview',
  '2': 'projects',
  '3': 'monitoring',
  '4': 'activity',
  '5': 'board',
};

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    el.isContentEditable
  );
}

export function useKeyboardShortcuts(config: ShortcutConfig): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        config.onCommandPalette();
        return;
      }

      if (event.key === 'Escape') {
        config.onCommandPalette();
        return;
      }

      if (TAB_BY_KEY[event.key]) {
        event.preventDefault();
        config.onTabChange(TAB_BY_KEY[event.key]);
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        config.onRefresh();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [config]);
}

