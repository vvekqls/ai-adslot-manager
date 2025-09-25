import { render, screen } from '@testing-library/react';
import { SlotMetricsGrid } from '@/components/SlotMetricsGrid';
import type { SlotSummary } from '@/lib/api';

describe('SlotMetricsGrid', () => {
  it('renders fallback when no metrics are available', () => {
    render(<SlotMetricsGrid summaries={[]} />);
    expect(screen.getByText(/Awaiting metrics/i)).toBeInTheDocument();
  });

  it('renders metrics for each slot', () => {
    const summaries: SlotSummary[] = [
      {
        slotId: 'slot-123',
        avgCls: 0.02,
        avgLcp: 1800,
        avgFid: 12,
        avgTbt: 60,
        avgAdLoadTime: 1500,
        avgTimeoutRate: 0.03,
        avgViewability: 0.7,
        samples: 4
      }
    ];

    render(<SlotMetricsGrid summaries={summaries} />);

    expect(screen.getByText(/slot-123/i)).toBeInTheDocument();
    expect(screen.getByText(/1500 ms/i)).toBeInTheDocument();
    expect(screen.getByText(/70%/i)).toBeInTheDocument();
  });
});
