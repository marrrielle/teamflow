import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LogoutButton } from '@/features/auth/logout';
import { ThemeToggle } from '@/features/theme/toggle-theme';
import { useAuth } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

const NAV_LINKS = [
  { to: ROUTES.dashboard, label: 'Dashboard', end: true },
  { to: ROUTES.projects, label: 'Projects', end: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-lg font-semibold">TeamFlow</span>
          <nav className="flex gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? <span className="hidden text-sm text-neutral-500 sm:inline">{user.name}</span> : null}
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
