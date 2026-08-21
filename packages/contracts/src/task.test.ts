import { describe, expect, it } from 'vitest';
import { createTaskSchema } from './task';

describe('createTaskSchema', () => {
  it('accepts a minimal valid payload and defaults priority to medium', () => {
    const result = createTaskSchema.parse({ title: 'Write tests' });
    expect(result).toEqual({ title: 'Write tests', priority: 'medium' });
  });

  it('accepts a fully populated payload', () => {
    const result = createTaskSchema.parse({
      title: 'Ship the feature',
      description: 'Details',
      priority: 'urgent',
      assigneeId: '11111111-1111-1111-1111-111111111111',
      dueDate: '2026-01-01T00:00:00.000Z',
    });
    expect(result.priority).toBe('urgent');
  });

  it('rejects an empty title', () => {
    expect(() => createTaskSchema.parse({ title: '' })).toThrow();
  });

  it('rejects a title over 200 characters', () => {
    expect(() => createTaskSchema.parse({ title: 'x'.repeat(201) })).toThrow();
  });

  it('rejects an invalid priority value', () => {
    expect(() => createTaskSchema.parse({ title: 'Task', priority: 'critical' })).toThrow();
  });

  it('rejects a non-UUID assigneeId', () => {
    expect(() => createTaskSchema.parse({ title: 'Task', assigneeId: 'not-a-uuid' })).toThrow();
  });

  it('rejects a dueDate that is not a full ISO datetime', () => {
    expect(() => createTaskSchema.parse({ title: 'Task', dueDate: '2026-01-01' })).toThrow();
  });

  it('allows a null assigneeId and null dueDate (unassigned, no due date)', () => {
    const result = createTaskSchema.parse({ title: 'Task', assigneeId: null, dueDate: null });
    expect(result.assigneeId).toBeNull();
    expect(result.dueDate).toBeNull();
  });
});
