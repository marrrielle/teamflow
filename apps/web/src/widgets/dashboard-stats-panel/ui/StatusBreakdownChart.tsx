import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TaskStatus } from '@teamflow/contracts';

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];
const STATUS_LABELS: Record<TaskStatus, string> = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
// Matches entities/task StatusBadge's neutral/amber/emerald palette so the chart and badges read as one system.
const STATUS_COLORS: Record<TaskStatus, string> = { todo: '#a3a3a3', in_progress: '#f59e0b', done: '#10b981' };

export function StatusBreakdownChart({ statusBreakdown }: { statusBreakdown: Partial<Record<TaskStatus, number>> }) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: statusBreakdown[status] ?? 0,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="currentColor" className="text-neutral-500" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-neutral-500" />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value) => [value, 'Tasks']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
