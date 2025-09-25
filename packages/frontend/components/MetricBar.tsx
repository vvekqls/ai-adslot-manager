import { formatMillis, formatPercent } from '@/lib/utils';

type MetricBarProps = {
  label: string;
  value: number;
  max: number;
  type: 'time' | 'ratio';
};

export const MetricBar = ({ label, value, max, type }: MetricBarProps) => {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-medium text-slate-700">
          {type === 'time' ? formatMillis(value) : formatPercent(value)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
