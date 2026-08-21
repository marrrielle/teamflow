import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ProjectId } from '@teamflow/contracts';
import { apiClient } from '@/shared/api/client';
import { CreateTaskDialog } from './CreateTaskDialog';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const showToast = vi.fn();
vi.mock('@/shared/lib/toast', () => ({
  useToast: () => ({ showToast }),
}));

const PROJECT_ID = '11111111-1111-1111-1111-111111111111' as ProjectId;

function renderDialog() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <CreateTaskDialog projectId={PROJECT_ID} />
    </QueryClientProvider>,
  );
}

describe('CreateTaskDialog', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset().mockResolvedValue({ ok: true, data: [] });
    vi.mocked(apiClient.post).mockReset();
    showToast.mockReset();
  });

  it('rejects an empty title and never calls the API', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /new task/i }));

    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    expect(await screen.findByText(/at least 1 character/i)).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('shows the server error as a toast when task creation fails', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ok: false, error: { status: 409, message: 'Title already exists' } });
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: /new task/i }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Duplicate task' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Title already exists', 'error'));
  });

  it('submits a valid payload and shows a success toast', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      ok: true,
      data: {
        id: '22222222-2222-2222-2222-222222222222',
        projectId: PROJECT_ID,
        title: 'New task',
        description: null,
        status: 'todo',
        priority: 'medium',
        assigneeId: null,
        dueDate: null,
        position: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: /new task/i }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New task' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Task created', 'success'));
    expect(apiClient.post).toHaveBeenCalledWith(
      `/projects/${PROJECT_ID}/tasks`,
      expect.objectContaining({ title: 'New task', priority: 'medium' }),
    );
  });
});
