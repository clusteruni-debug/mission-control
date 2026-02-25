import { cn } from '@/lib/utils';

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  alert?: 'warn' | 'danger';
}

export function SummaryCard({ icon: Icon, label, value, alert }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        alert === 'danger'
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
          : alert === 'warn'
            ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      )}
    >
      <Icon
        className={cn(
          'mb-2 h-5 w-5',
          alert === 'danger'
            ? 'text-red-500'
            : alert === 'warn'
              ? 'text-yellow-500'
              : 'text-gray-400'
        )}
      />
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
