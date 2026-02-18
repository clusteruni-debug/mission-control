'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import {
  Search,
  LayoutDashboard,
  RefreshCw,
  Bot,
  Wallet,
  Activity,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onAction: (action: string) => void;
}

type PaletteItem = {
  id: string;
  title: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  execute: () => void;
};

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onAction,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  const items = useMemo<PaletteItem[]>(
    () => [
      { id: 'tab-overview', title: 'Overview로 이동', icon: LayoutDashboard, execute: () => onNavigate('overview') },
      { id: 'tab-projects', title: '프로젝트로 이동', icon: LayoutDashboard, execute: () => onNavigate('projects') },
      { id: 'tab-monitoring', title: '모니터링으로 이동', icon: Activity, execute: () => onNavigate('monitoring') },
      { id: 'tab-openclaw', title: 'OpenClaw로 이동', icon: Bot, execute: () => onNavigate('openclaw') },
      { id: 'quick-balance', title: 'Make Money 잔고 조회', hint: '빠른 조회', icon: Wallet, execute: () => onAction('quick_make_money_balance') },
      { id: 'quick-openclaw', title: 'OpenClaw 상태 조회', hint: '빠른 조회', icon: Bot, execute: () => onAction('quick_openclaw_status') },
      { id: 'quick-events', title: '이벤트 참여율 조회', hint: '빠른 조회', icon: Activity, execute: () => onAction('quick_event_participation') },
      { id: 'run-openclaw', title: 'OpenClaw에서 작업 실행', hint: 'OpenClaw 탭 이동', icon: Bot, execute: () => onAction('focus_openclaw_command') },
      { id: 'refresh', title: '전체 새로고침', hint: 'R', icon: RefreshCw, execute: () => onAction('refresh_all') },
    ],
    [onNavigate, onAction]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setIndex(0);
      return;
    }
    setIndex(0);
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (!filtered[index]) return;
        filtered[index].execute();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, filtered, index, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="명령 검색..."
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <span className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Esc
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다.
            </p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  item.execute();
                  onClose();
                }}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm ${
                  idx === index
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/70'
                }`}
              >
                <item.icon className="h-4 w-4 text-gray-400" />
                <span className="flex-1">{item.title}</span>
                {item.hint && (
                  <span className="text-xs text-gray-400">{item.hint}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
