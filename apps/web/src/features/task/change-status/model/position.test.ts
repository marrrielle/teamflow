import { describe, expect, it } from 'vitest';
import type { ProjectId, Task, TaskId } from '@teamflow/contracts';
import { computeDropPosition, needsRenormalization, renormalizedPositions } from './position';

function makeTask(id: string, position: number): Task {
  return {
    id: id as TaskId,
    projectId: 'project-1' as ProjectId,
    title: `Task ${id}`,
    description: null,
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    dueDate: null,
    position,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('computeDropPosition', () => {
  it('returns the default gap when dropping into an empty column', () => {
    expect(computeDropPosition([], 0)).toBe(1024);
  });

  it('returns before.position - gap when dropping at the start', () => {
    const tasks = [makeTask('a', 2048), makeTask('b', 3072)];
    expect(computeDropPosition(tasks, 0)).toBe(2048 - 1024);
  });

  it('returns after.position + gap when dropping at the end', () => {
    const tasks = [makeTask('a', 2048), makeTask('b', 3072)];
    expect(computeDropPosition(tasks, 2)).toBe(3072 + 1024);
  });

  it('returns the midpoint when dropping between two tasks', () => {
    const tasks = [makeTask('a', 1000), makeTask('b', 2000)];
    expect(computeDropPosition(tasks, 1)).toBe(1500);
  });
});

describe('needsRenormalization', () => {
  it('is false when there is enough room between neighbors', () => {
    const tasks = [makeTask('a', 1000), makeTask('b', 2000)];
    expect(needsRenormalization(tasks, 1)).toBe(false);
  });

  it('is true once neighbor positions have collapsed onto each other', () => {
    const tasks = [makeTask('a', 1000), makeTask('b', 1000 + 1e-9)];
    expect(needsRenormalization(tasks, 1)).toBe(true);
  });

  it('is false at the start or end of the column (no two neighbors to collide)', () => {
    const tasks = [makeTask('a', 1000)];
    expect(needsRenormalization(tasks, 0)).toBe(false);
    expect(needsRenormalization(tasks, 1)).toBe(false);
  });
});

describe('renormalizedPositions', () => {
  it('re-spaces every task in order with fresh 1024-wide gaps', () => {
    const tasks = [makeTask('a', 1), makeTask('b', 1.0000001), makeTask('c', 1.0000002)];
    expect(renormalizedPositions(tasks)).toEqual([
      { id: 'a', position: 1024 },
      { id: 'b', position: 2048 },
      { id: 'c', position: 3072 },
    ]);
  });
});
