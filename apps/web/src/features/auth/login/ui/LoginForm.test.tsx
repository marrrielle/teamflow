import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { apiClient } from '@/shared/api/client';
import { userKeys } from '@/entities/user';
import { LoginForm } from './LoginForm';

vi.mock('@/shared/api/client', () => ({
  apiClient: { post: vi.fn() },
}));

const showToast = vi.fn();
vi.mock('@/shared/lib/toast', () => ({
  useToast: () => ({ showToast }),
}));

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return { queryClient };
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
    showToast.mockReset();
  });

  it('shows field validation errors and does not call the API when submitted empty', async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 character/i)).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('submits valid credentials and caches the returned user on success', async () => {
    const fakeUser = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'alice@teamflow.dev',
      name: 'Alice Chen',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    vi.mocked(apiClient.post).mockResolvedValue({ ok: true, data: fakeUser });

    const { queryClient } = renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@teamflow.dev' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'alice@teamflow.dev',
        password: 'password123',
      });
    });
    await waitFor(() => {
      expect(queryClient.getQueryData(userKeys.me())).toEqual(fakeUser);
    });
    expect(showToast).toHaveBeenCalledWith('Welcome back, Alice Chen', 'success');
  });

  it('shows the server error message and a toast when login fails', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ok: false, error: { status: 401, message: 'Invalid email or password' } });

    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@teamflow.dev' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith('Invalid email or password', 'error');
  });
});
