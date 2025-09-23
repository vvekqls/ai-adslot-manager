import type { SlotSummary } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MetricBar } from './MetricBar';

const metricDescriptors = [
  { key: 'avgAdLoadTime', label: 'Ad Load Time', type: 'time', max: 4000 },
  { key: 'avgTimeoutRate', label: 'Timeout Rate', type: 'ratio', max: 1 },
  { key: 'avgViewability', label: 'Viewability', type: 'ratio', max: 1 },
  { key: 'avgCls', label: 'CLS', type: 'ratio', max: 0.3 },
  { key: 'avgLcp', label: 'LCP', type: 'time', max: 3500 },
  { key: 'avgTbt', label: 'TBT', type: 'time', max: 600 }
] as const;

type SlotMetricsGridProps = {
  summaries: SlotSummary[];
};

export const SlotMetricsGrid = ({ summaries }: SlotMetricsGridProps) => {
  if (!summaries.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Awaiting metrics</CardTitle>
          <CardDescription>
            Interact with the article to generate sample telemetry for each slot.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {summaries.map((summary) => (
        <Card key={summary.slotId}>
          <CardHeader>
            <CardTitle>{summary.slotId}</CardTitle>
            <CardDescription>{summary.samples} samples aggregated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metricDescriptors.map((metric) => (
              <MetricBar
                key={metric.key}
                label={metric.label}
                value={summary[metric.key] as number}
                max={metric.max}
                type={metric.type}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
