import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/entities/user';
import { ThemeProvider } from '@/shared/lib/theme';
import { ToastProvider } from '@/shared/lib/toast';
import { ToastViewport } from '@/shared/ui';
import { queryClient } from './providers/query-client';
import { AppRouter } from './router';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </QueryClientProvider>
        <ToastViewport />
      </ToastProvider>
    </ThemeProvider>
  );
}
