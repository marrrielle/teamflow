import { useEffect, useState } from 'react';
import { taskFiltersSchema, taskStatusSchema, taskPrioritySchema, type TaskFilters } from '@teamflow/contracts';
import { useUsersQuery } from '@/entities/user';
import { useSearchParamsState } from '@/shared/lib/use-search-params-state';
import { useDebounce } from '@/shared/lib/use-debounce';
import { Input, Select } from '@/shared/ui';

interface TaskFiltersBarProps {
  showSort?: boolean;
}

/**
 * Reads/writes task filters straight from the URL via useSearchParamsState — it owns
 * no filter state of its own. Pages that need the current filters call
 * useSearchParamsState(taskFiltersSchema) themselves so both stay in sync through the
 * single URL source of truth, rather than this widget re-broadcasting them as a prop.
 */
export function TaskFiltersBar({ showSort = true }: TaskFiltersBarProps) {
  const [filters, setFilters] = useSearchParamsState(taskFiltersSchema);
  const { data: users } = useUsersQuery();
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== (filters.search ?? '')) {
      setFilters({ search: debouncedSearch || undefined });
    }
    // Intentionally reacts only to the debounced value — re-running this on every
    // `filters`/`setFilters` identity change would fight the debounce.
  }, [debouncedSearch]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search tasks…"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        className="w-48"
        aria-label="Search tasks"
      />
      <Select
        value={filters.status ?? ''}
        onChange={(event) => setFilters({ status: (event.target.value || undefined) as TaskFilters['status'] })}
        className="w-auto"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {taskStatusSchema.options.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>
      <Select
        value={filters.priority ?? ''}
        onChange={(event) => setFilters({ priority: (event.target.value || undefined) as TaskFilters['priority'] })}
        className="w-auto"
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {taskPrioritySchema.options.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </Select>
      <Select
        value={filters.assigneeId ?? ''}
        onChange={(event) => setFilters({ assigneeId: (event.target.value || undefined) as TaskFilters['assigneeId'] })}
        className="w-auto"
        aria-label="Filter by assignee"
      >
        <option value="">Anyone</option>
        {users?.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </Select>
      {showSort ? (
        <>
          <Select
            value={filters.sortBy ?? 'position'}
            onChange={(event) => setFilters({ sortBy: event.target.value as TaskFilters['sortBy'] })}
            className="w-auto"
            aria-label="Sort by"
          >
            <option value="position">Manual order</option>
            <option value="createdAt">Created</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
          </Select>
          <Select
            value={filters.sortOrder ?? 'asc'}
            onChange={(event) => setFilters({ sortOrder: event.target.value as TaskFilters['sortOrder'] })}
            className="w-auto"
            aria-label="Sort order"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </>
      ) : null}
    </div>
  );
}
