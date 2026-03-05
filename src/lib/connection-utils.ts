import type { ConnectionType } from '@/types';

export interface ConnectionTypeMeta {
  label: string;
  color: string;
  bg: string;
}

export const CONNECTION_TYPE_META: Record<ConnectionType, ConnectionTypeMeta> = {
  'supabase-shared': {
    label: 'Supabase',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-100 dark:bg-purple-900',
  },
  firebase: {
    label: 'Firebase',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-100 dark:bg-amber-900',
  },
  'api-proxy': {
    label: 'API Proxy',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900',
  },
  'api-direct': {
    label: 'API Direct',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100 dark:bg-emerald-900',
  },
  'url-handoff': {
    label: 'URL',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-700',
  },
  'chrome-extension': {
    label: 'Extension',
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-900',
  },
  'shared-instance': {
    label: 'Shared DB',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
};
