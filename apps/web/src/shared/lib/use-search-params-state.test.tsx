import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { taskFiltersSchema } from '@teamflow/contracts';
import { useSearchParamsState } from './use-search-params-state';

function wrapper({ children, initialPath = '/' }: { children: ReactNode; initialPath?: string }) {
  return <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>;
}

describe('useSearchParamsState', () => {
  it('defaults to an empty object when the URL has no query string', () => {
    const { result } = renderHook(() => useSearchParamsState(taskFiltersSchema), { wrapper });
    expect(result.current[0]).toEqual({});
  });

  it('parses known filter keys already present in the URL', () => {
    const { result } = renderHook(() => useSearchParamsState(taskFiltersSchema), {
      wrapper: (props) => wrapper({ ...props, initialPath: '/?status=todo&priority=high' }),
    });
    expect(result.current[0]).toEqual({ status: 'todo', priority: 'high' });
  });

  it('ignores query params that fail schema validation instead of throwing', () => {
    const { result } = renderHook(() => useSearchParamsState(taskFiltersSchema), {
      wrapper: (props) => wrapper({ ...props, initialPath: '/?status=not-a-real-status' }),
    });
    expect(result.current[0]).toEqual({});
  });

  it('writes a patch into the URL and reflects it on the next read', () => {
    const { result } = renderHook(() => useSearchParamsState(taskFiltersSchema), { wrapper });

    act(() => {
      result.current[1]({ status: 'in_progress', search: 'landing' });
    });

    expect(result.current[0]).toEqual({ status: 'in_progress', search: 'landing' });
  });

  it('removes a key from the URL when patched with undefined/empty string', () => {
    const { result } = renderHook(() => useSearchParamsState(taskFiltersSchema), {
      wrapper: (props) => wrapper({ ...props, initialPath: '/?status=done&search=foo' }),
    });

    act(() => {
      result.current[1]({ search: '' });
    });

    expect(result.current[0]).toEqual({ status: 'done' });
  });
});
