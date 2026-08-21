import type { User } from '@teamflow/contracts';
import { cn } from '@/shared/lib/cn';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ user, className }: { user: User | null; className?: string }) {
  if (!user) {
    return (
      <span
        title="Unassigned"
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-neutral-300 text-[10px] text-neutral-400 dark:border-neutral-700',
          className,
        )}
      >
        ?
      </span>
    );
  }

  return (
    <span
      title={user.name}
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-medium text-white',
        className,
      )}
    >
      {initialsOf(user.name)}
    </span>
  );
}
