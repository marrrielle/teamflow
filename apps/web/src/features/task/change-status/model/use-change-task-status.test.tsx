import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { ProjectId, Task, TaskId } from '@teamflow/contracts';
import { taskKeys } from '@/entities/task';
import { apiClient } from '@/shared/api/client';
import { useChangeTaskStatus } from './use-change-task-status';

vi.mock('@/shared/api/client', () => ({
  apiClient: { patch: vi.fn() },
}));

const showToast = vi.fn();
vi.mock('@/shared/lib/toast', () => ({
  useToast: () => ({ showToast }),
}));

const PROJECT_ID = 'project-1' as ProjectId;
const FILTERS = {};

function makeTask(id: string, status: Task['status'], position: number): Task {
  return {
    id: id as TaskId,
    projectId: PROJECT_ID,
    title: `Task ${id}`,
    description: null,
    status,
    priority: 'medium',
    assigneeId: null,
    dueDate: null,
    position,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const listKey = taskKeys.list(PROJECT_ID, FILTERS);
  const initialTasks = [makeTask('a', 'todo', 1024), makeTask('b', 'todo', 2048)];
  queryClient.setQueryData(listKey, initialTasks);

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, listKey, initialTasks, wrapper };
}

describe('useChangeTaskStatus', () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
    showToast.mockReset();
  });

  it('applies the status+position change to the cache immediately (optimistic update)', async () => {
    const { queryClient, listKey, wrapper } = setup();
    // Never resolves during this test — isolates the synchronous onMutate effect.
    vi.mocked(apiClient.patch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useChangeTaskStatus(PROJECT_ID, FILTERS), { wrapper });

    act(() => {
      result.current.mutate({ taskId: 'a' as TaskId, status: 'in_progress', position: 512 });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<Task[]>(listKey);
      expect(cached?.find((t) => t.id === 'a')).toMatchObject({ status: 'in_progress', position: 512 });
    });
  });

  it('rolls back to the pre-drag snapshot and shows an error toast when the request fails', async () => {
    const { queryClient, listKey, initialTasks, wrapper } = setup();
    vi.mocked(apiClient.patch).mockResolvedValue({ ok: false, error: { status: 500, message: 'Server error' } });

    const { result } = renderHook(() => useChangeTaskStatus(PROJECT_ID, FILTERS), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ taskId: 'a' as TaskId, status: 'done', position: 9999 }).catch(() => {});
    });

    expect(queryClient.getQueryData<Task[]>(listKey)).toEqual(initialTasks);
    expect(showToast).toHaveBeenCalledWith('Server error', 'error');
  });
});
