import { cn } from '@/shared/lib/cn';

interface StatCardProps {
  label: string;
  value: number;
  accent?: 'default' | 'warning';
}

export function StatCard({ label, value, accent = 'default' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold', accent === 'warning' && value > 0 && 'text-red-600 dark:text-red-400')}>
        {value}
      </p>
    </div>
  );
}
