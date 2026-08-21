import { useTheme } from '@/shared/lib/theme';
import { Button } from '@/shared/ui';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </Button>
  );
}
