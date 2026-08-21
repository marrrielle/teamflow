import type { Task, TaskId } from '@teamflow/contracts';

const POSITION_GAP = 1024;
const MIN_GAP = 1e-7;

/** Position for inserting a task at `targetIndex` among `orderedTasks` (which must not include it). */
export function computeDropPosition(orderedTasks: readonly Task[], targetIndex: number): number {
  const before = orderedTasks[targetIndex - 1];
  const after = orderedTasks[targetIndex];
  if (!before && !after) return POSITION_GAP;
  if (!before) return after!.position - POSITION_GAP;
  if (!after) return before.position + POSITION_GAP;
  return (before.position + after.position) / 2;
}

/** True once the midpoint between neighbors has collapsed onto one of them (float precision exhausted). */
export function needsRenormalization(orderedTasks: readonly Task[], targetIndex: number): boolean {
  const before = orderedTasks[targetIndex - 1];
  const after = orderedTasks[targetIndex];
  if (!before || !after) return false;
  return Math.abs(after.position - before.position) < MIN_GAP;
}

/** Re-spaces an entire ordered column with fresh gaps — the fallback once positions collide. */
export function renormalizedPositions(orderedTasks: readonly Task[]): Array<{ id: TaskId; position: number }> {
  return orderedTasks.map((task, index) => ({ id: task.id, position: (index + 1) * POSITION_GAP }));
}
